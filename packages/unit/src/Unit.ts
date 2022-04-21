import {assert, isFunction, isInstanceOf, logger, Logger} from "@bunt/util";
import {ApplyContext, Context} from "./Context";
import {Action} from "./Action";
import {
    ActionCtor,
    ActionCtorImport,
    ActionFactory,
    ActionReturn,
    ActionState,
    ContextArg,
    StateType,
} from "./interfaces";

export class Unit<C extends Context> {
    @logger
    protected readonly logger!: Logger;

    readonly #context: ApplyContext<C>;

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

    public async run<A extends Action<C, S, R>, S extends StateType, R = unknown>(
        factory: ActionFactory<C, S, R, A>,
        state: ActionState<A>): Promise<ActionReturn<Action<C, S, R>>> {
        const ctor = await Unit.getAction(factory) as ActionCtor<C, S, R, A>;
        assert(Action.isPrototypeOf(ctor), "The 'ctor' hasn't prototype of the Action class");

        const finish = this.logger.perf("run", {action: ctor.name});
        const action = new ctor(this.#context, state);

        return Promise.resolve(action.run()).finally(finish);
    }

    public static async getAction(action: ActionFactory<any>): Promise<ActionCtor<any>> {
        if (this.isActionFactory(action)) {
            const {default: ctor} = await action();

            return ctor;
        }

        return action;
    }

    private static isActionFactory(action: ActionFactory<any>): action is ActionCtorImport<any> {
        return !Action.isPrototypeOf(action);
    }
}

export function unit<C extends Context>(context: ContextArg<C>): Promise<Unit<C>> {
    return Unit.factory<C>(context);
}
