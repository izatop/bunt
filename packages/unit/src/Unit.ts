import {assert, fails, isClass, isFunction, isInstanceOf, isUndefined, logger, Logger} from "@bunt/util";
import {Action} from "./Action";
import {ApplyContext, Context} from "./Context";
import {ActionCtor, ActionReturn, ActionState, ContextArg, StateType} from "./interfaces";

export class Unit<C extends Context> {
    @logger
    protected readonly logger!: Logger;

    readonly #context: ApplyContext<C>;

    readonly #registry = new WeakSet<ActionCtor<C>>();

    protected constructor(context: ApplyContext<C>, actions: ActionCtor<C>[] = []) {
        this.#context = context;
        this.add(...actions);
    }

    public get context(): ApplyContext<C> {
        return this.#context;
    }

    public static from<C extends Context>(
        context: ApplyContext<C>,
        actions: ActionCtor<C>[] = []): Unit<C> {
        return new this(context, actions);
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        actions: ActionCtor<C>[] = []): Promise<Unit<C>> {
        return new this<C>(await this.getContext(context), actions);
    }

    protected static async getContext<C extends Context>(context: ContextArg<C>): Promise<ApplyContext<C>> {
        if (isFunction(context)) {
            return this.getContext(await context());
        }

        assert(isInstanceOf(context, Context), `Wrong context type`);
        return Context.apply(await context);
    }

    public add(...actions: ActionCtor<C>[]): ActionCtor<C>[] {
        const added: ActionCtor<C>[] = [];
        for (const ctor of actions) {
            fails(isUndefined(ctor), "Wrong the Action type");
            if (!this.#registry.has(ctor)) {
                this.#registry.add(ctor);
                added.push(ctor);
            }
        }

        return added;
    }

    public remove(...actions: ActionCtor<C>[]): ActionCtor<C>[] {
        const removed: ActionCtor<C>[] = [];
        for (const ctor of actions) {
            fails(isUndefined(ctor), "Wrong the Action type");
            if (this.#registry.has(ctor)) {
                this.#registry.delete(ctor);
                removed.push(ctor);
            }
        }

        return removed;
    }

    public has(action: ActionCtor<C>): boolean {
        return this.#registry.has(action);
    }

    public async run<A extends Action<C, S, R>, S extends StateType | null, R = unknown>(
        ctor: ActionCtor<C, S, R, A>,
        state: ActionState<A>): Promise<ActionReturn<Action<C, any>>> {
        const finish = this.logger.perf("action", {action: ctor.name});
        assert(isClass(ctor), "Wrong the Action type");
        assert(this.#registry.has(ctor), `Unknown action ${ctor.name}`);

        const action = new ctor(this.#context, state);
        return Promise.resolve(action.run()).finally(finish);
    }
}

export function unit<C extends Context>(
    context: ContextArg<C>,
    actions: ActionCtor<C>[] = []): Promise<Unit<C>> {
    return Unit.factory<C>(context, actions);
}
