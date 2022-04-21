import {Promisify} from "@bunt/util";
import {Action} from "./Action";
import {ApplyContext, Context} from "./Context";

export type ActionAny<C extends Context = Context, S extends StateType | null = any, R = any> = Action<C, S, R>;

export type ContextArg<C extends Context> = (() => Promisify<C>) | Promisify<C>;

export type ActionCtor<C extends Context,
    S extends StateType | null = any,
    R = unknown,
    A extends Action<C, S, R> = Action<C, S, R>> = {
        new(context: ApplyContext<C>, state: S): A;

        prototype: A;
    };

export type ActionCtorImport<C extends Context,
    S extends StateType | null = any,
    R = unknown,
    A extends Action<C, S, R> = Action<C, S, R>> = () => Promise<{default: ActionCtor<C, S, R, A>}>;

export type ActionFactory<C extends Context,
    S extends StateType | null = any,
    R = unknown,
    A extends Action<C, S, R> = Action<C, S, R>> = ActionCtor<C, S, R, A> | ActionCtorImport<C, S, R, A>;


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
