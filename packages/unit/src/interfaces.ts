import {Promisify} from "@bunt/util";
import {Action} from "./Action";
import {Context, MatchContext} from "./Context";

export interface IContext {}

export type ContextArg<C extends Context> = (() => Promisify<C>) | Promisify<C>;

export type ActionStateArgs<A> = ActionState<A> extends null ? [] : [ActionState<A>];
export type ActionContextCtor<C extends IContext,
    A extends Action<C, any> = Action<C, any>> = {
    new(context: C, state: any): A;
    prototype: A;
};

export type ActionCtor<A extends Action<any, any>> = {
    new(context: ActionCtx<A>, state: any): A;
    prototype: A;
};

export type ActionCtx<A> = A extends Action<infer T, any> ? T : never;
export type ActionState<A> = A extends Action<any, infer T> ? T : never;
export type ActionReturn<A> = A extends Action<any, any, infer T> ? T : never;
export type ActionContext<A> = ActionCtx<A>;

export type UnitAction<C, T> = T extends ActionCtor<infer A>
    ? A extends Action<infer AC, any>
        ? MatchContext<C, AC> extends AC
            ? T
            : never // ["Action context doesn't match its parent context", C, AC]
        : never // ["Action doesn't satisfy its interface", A]
    : never; // ["Action doesn't satisfy its type", T];

export type ResolvableValue<T> = Promise<T> | (() => T | Promise<T>);

export interface IServiceResolver<T> {
    resolve(): Promise<T>;
}

export type StateType = Record<string, any>;

export interface IShadowState<T> {
    getShadowState(): T;
}
