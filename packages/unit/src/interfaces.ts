import {Fn, Promisify} from "@bunt/type";
import {Action} from "./Action.js";
import {ApplyContext, Context} from "./Context/index.js";

export type ActionAny<C extends Context = Context, S extends StateType | null = any, R = any> = Action<C, S, R>;

export type ContextArg<C extends Context> = (() => Promisify<C>) | Promisify<C>;

export type ActionCtor<A extends ActionAny> = {
    new(context: ApplyContext<ActionContext<A>>, state: ActionState<A>): A;
    prototype: A;
};

export type ActionImport<A extends ActionAny> = Fn<[], Promise<{default: ActionCtor<A>}>>;
export type AsyncActionFactory<A extends ActionAny> = {factory: ActionImport<A>};
export type ActionFactory<A extends ActionAny> = ActionCtor<A> | AsyncActionFactory<A>;

export type ActionContext<A> = A extends ActionAny<infer T> ? T : never;
export type ActionState<A> = A extends ActionAny<any, infer T> ? T : never;
export type ActionReturn<A> = A extends ActionAny<any, any, infer T> ? T : never;

export type ResolvableValue<T> = Promise<T> | (() => T | Promise<T>);

export interface IServiceResolver<T> {
    resolve(): Promise<T>;
}

export type StateType = Record<string, any> | null;

export interface IShadowState<T> {
    getShadowState(): T;
}

export type ActionTransactionFinish = (reason: unknown | null) => void;
export type ActionTransactionStart<C> = (action: string, context: ApplyContext<C>) => ActionTransactionFinish;
export type ActionTransactionCatch<C> = (reason: unknown, context: ApplyContext<C>) => void;

export type ActionTransactionHandlers<C> = {
    start?: ActionTransactionStart<C>;
    error?: ActionTransactionCatch<C>;
};
