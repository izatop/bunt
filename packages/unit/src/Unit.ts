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
    protected readonly logger!: Logger;

    readonly #context: ApplyContext<C>;
    readonly #handlers: ActionTransactionHandlers = {};

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

    protected static async getContext<C extends Context>(context: ContextArg<C>): Promise<ApplyContext<C>> {
        if (isFunction(context)) {
            return this.getContext(await context());
        }

        const syncContext = await context;
        assert(isInstanceOf(syncContext, Context), "Wrong context type");

        return Context.apply(syncContext);
    }

    public on(handlers: ActionTransactionHandlers) {
        Object.assign(this.#handlers, handlers);
    }

    public async run<A extends ActionAny<C>>(
        factory: ActionFactory<A>,
        state: ActionState<A>): Promise<ActionReturn<A>> {
        const ctor = await Unit.getAction(factory);
        assert(Action.isPrototypeOf(ctor), "The 'ctor' hasn't prototype of the Action class");

        const finish = this.logger.perf("run", {action: ctor.name});
        const action = new ctor(this.#context, state);

        return this.watch(() => action.run())
            .finally(finish);
    }

    public static async getAction(action: ActionFactory<any>): Promise<ActionCtor<any>> {
        if (this.isActionFactory(action)) {
            const {default: ctor} = await action.factory();

            return ctor;
        }

        return action;
    }

    private watch<T>(run: () => Promise<T> | T): Promise<T> {
        const {start, commit, rollback} = this.#handlers;
        const pending = Promise.resolve()
            .then(start)
            .then(run);

        if (commit) {
            return pending.finally(() => pending.then(commit, rollback));
        }

        if (rollback) {
            return pending.finally(() => pending.catch(rollback));
        }

        return pending;
    }

    private static isActionFactory(action: ActionFactory<any>): action is AsyncActionFactory<any> {
        return !Action.isPrototypeOf(action);
    }
}

export function unit<C extends Context>(context: ContextArg<C>): Promise<Unit<C>> {
    return Unit.factory<C>(context);
}
