import {IServiceResolver} from "../interfaces";
import {Context} from "./Context";

export type ResolveService<T extends any> = T extends IServiceResolver<infer S> ? Promise<S> : T;

export type ApplyContext<C extends Context> = C & {
    [K in keyof C]: C[K] extends IServiceResolver<infer S>
        ? S
        : C[K];
};
