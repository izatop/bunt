import {assert, asyncCall, isFunction, isInstanceOf, logger, Logger} from "@bunt/util";
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

    public static async getAction<C extends Context>(action: ActionFactory<any>)
        : Promise<ActionCtor<Action<C, any, any>>> {
        if (this.isActionFactory(action)) {
            const {default: ctor} = await action.factory();

            return ctor;
        }

        return action;
    }

    protected static isActionFactory(action: ActionFactory<any>): action is AsyncActionFactory<any> {
        return !Action.isPrototypeOf(action);
    }

    protected static async getContext<C extends Context>(context: ContextArg<C>): Promise<ApplyContext<C>> {
        if (isFunction(context)) {
            return this.getContext(context());
        }

        const syncContext = await context;
        assert(isInstanceOf(syncContext, Context), "Wrong context type");

        return Context.apply(syncContext);
    }

    public on(handlers: ActionTransactionHandlers<C>): void {
        Object.assign(this.#handlers, handlers);
    }

    public async exec<A extends ActionAny<C>>(
        factory: ActionFactory<A>,
        state: ActionState<A>): Promise<ActionReturn<A>> {
        const ctor = await Unit.getAction<C>(factory);
        assert(Action.isPrototypeOf(ctor), "The 'ctor' hasn't prototype of the Action class");

        const perf = this.logger.perf("run", {action: ctor.name});
        const action = new ctor(this.#context, state);
        const {start} = this.#handlers;
        const finish = start?.(action.name, this.context);

        return asyncCall(() => action.run())
            .finally(finish)
            .finally(perf);
    }

    public async run<A extends ActionAny<C>>(
        factory: ActionFactory<A>,
        state: ActionState<A>): Promise<ActionReturn<A>> {
        return this.watch(() => this.exec(factory, state));
    }

    public async watch<T>(run: () => Promise<T>): Promise<T> {
        const {error} = this.#handlers;

        try {
            return await run();
        } catch (reason) {
            error?.(reason, this.context);

            throw reason;
        }
    }

    public getTransactionHandlers(): ActionTransactionHandlers<C> {
        return this.#handlers;
    }
}
