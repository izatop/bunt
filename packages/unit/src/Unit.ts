import {assert, fails, isClass, isFunction, isInstanceOf, isUndefined, logger, Logger} from "@bunt/util";
import {Action} from "./Action";
import {ApplyContext, Context} from "./Context";
import {ActionContextCtor, ActionReturn, ActionStateArgs, ContextArg, IContext} from "./interfaces";

export class Unit<C extends IContext = IContext> {
    @logger
    protected readonly logger!: Logger;

    readonly #context: C;

    readonly #registry = new WeakSet();

    protected constructor(context: C, actions: ActionContextCtor<C>[] = []) {
        this.#context = context;
        this.add(...actions);
    }

    public get context(): C {
        return this.#context;
    }

    public static from<C extends IContext>(
        context: C,
        actions: ActionContextCtor<C>[] = []): Unit<C> {
        return new this(context, actions);
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>,
        actions: ActionContextCtor<ApplyContext<C>>[] = []): Promise<Unit<ApplyContext<C>>> {
        return new this(await this.getContext<C>(context), actions);
    }

    protected static async getContext<C extends Context>(context: ContextArg<C>): Promise<ApplyContext<C>> {
        if (isFunction(context)) {
            return this.getContext(await context());
        }

        assert(isInstanceOf(context, Context), `Wrong context type`);
        return Context.apply(await context);
    }

    public add(...actions: ActionContextCtor<C>[]): ActionContextCtor<C>[] {
        const added: ActionContextCtor<C>[] = [];
        for (const ctor of actions) {
            fails(isUndefined(ctor), "Wrong the Action type");
            if (!this.#registry.has(ctor)) {
                this.#registry.add(ctor);
                added.push(ctor);
            }
        }

        return added;
    }

    public remove(...actions: ActionContextCtor<C>[]): ActionContextCtor<C>[] {
        const removed: ActionContextCtor<C>[] = [];
        for (const ctor of actions) {
            fails(isUndefined(ctor), "Wrong the Action type");
            if (this.#registry.has(ctor)) {
                this.#registry.delete(ctor);
                removed.push(ctor);
            }
        }

        return removed;
    }

    public has(action: ActionContextCtor<C>): boolean {
        return this.#registry.has(action);
    }

    /**
     * @deprecated see context
     */
    public getContext(): Promise<C> {
        return Promise.resolve(this.#context);
    }

    public async run<A extends Action<C, any>>(ctor: ActionContextCtor<C, A>,
                                               ...args: ActionStateArgs<A>): Promise<ActionReturn<A>> {
        const finish = this.logger.perf("action", {action: ctor.name});
        assert(isClass(ctor), "Wrong the Action type");
        assert(this.#registry.has(ctor), `Unknown action ${ctor.name}`);

        const [state = null] = args;
        const action = new ctor(this.#context, state);
        return Promise.resolve(action.run()).finally(finish);
    }
}

export function unit<C extends Context>(
    context: ContextArg<C>,
    actions: ActionContextCtor<ApplyContext<C>>[] = []): Promise<Unit<ApplyContext<C>>> {
    return Unit.factory<C>(context, actions);
}
