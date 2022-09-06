import {assert, isFunction, isInstanceOf, logger, Logger} from "@bunt/util";
import {ApplyContext, Context} from "./Context";
import {Action} from "./Action";
import {
    ActionAny,
    ActionCtor,
    ActionFactory,
    ActionReturn,
    ActionState,
    ActionTransactionHandlers,
    AsyncActionFactory,
    ContextArg,
} from "./interfaces";

export class Unit<C extends Context> {
    @logger
    declare protected readonly logger: Logger;

    readonly #context: ApplyContext<C>;
    readonly #handlers: ActionTransactionHandlers<C> = {};

    protected constructor(context: ApplyContext<C>) {
        this.#context = context;
    }

    public get context(): ApplyContext<C> {
        return this.#context;
    }

    public static from<C extends Context>(context: ApplyContext<C>): Unit<C> {
        return new this(context);
    }

    public static async factory<C extends Context>(context: ContextArg<C>): Promise<Unit<C>> {
        return new this<C>(await this.getContext(context));
    }

    public static async getAction(action: ActionFactory<any>): Promise<ActionCtor<any>> {
        if (this.isActionFactory(action)) {
            const {default: ctor} = await action.factory();

            return ctor;
        }

        return action;
    }

    protected static async getContext<C extends Context>(context: ContextArg<C>): Promise<ApplyContext<C>> {
        if (isFunction(context)) {
            return this.getContext(context());
        }

        const syncContext = await context;
        assert(isInstanceOf(syncContext, Context), "Wrong context type");

        return Context.apply(syncContext);
    }

    private static isActionFactory(action: ActionFactory<any>): action is AsyncActionFactory<any> {
        return !Action.isPrototypeOf(action);
    }

    public on(handlers: ActionTransactionHandlers<C>): void {
        Object.assign(this.#handlers, handlers);
    }

    public async run<A extends ActionAny<C>>(
        factory: ActionFactory<A>,
        state: ActionState<A>): Promise<ActionReturn<A>> {
        const ctor = await Unit.getAction(factory);
        assert(Action.isPrototypeOf(ctor), "The 'ctor' hasn't prototype of the Action class");

        const finish = this.logger.perf("run", {action: ctor.name});
        const action = new ctor(this.#context, state);

        return this.watch(ctor.name, () => action.run())
            .finally(finish);
    }

    private async watch<T>(action: string, run: () => Promise<T> | T): Promise<T> {
        const {start, error} = this.#handlers;
        const finish = start?.(action, this.context);

        try {
            return await Promise.resolve(run());
        } catch (reason) {
            error?.(reason, this.context);

            throw reason;
        } finally {
            finish?.();
        }
    }
}

export function unit<C extends Context>(context: ContextArg<C>): Promise<Unit<C>> {
    return Unit.factory<C>(context);
}
