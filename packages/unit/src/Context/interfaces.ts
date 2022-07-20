import {IServiceResolver} from "../interfaces";
import {Context} from "./Context";

export type ResolveService<T> = T extends IServiceResolver<infer S> ? Promise<S> : T;

export type ApplyContext<C extends Context> = {
    [K in keyof C]: C[K] extends IServiceResolver<infer S>
        ? S
        : C[K];
};
