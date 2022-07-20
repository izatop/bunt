import {IServiceResolver} from "../interfaces";

export type ResolveService<T> = T extends IServiceResolver<infer S> ? Promise<S> : T;

export type ApplyContext<C> = C & {
    [K in keyof C]: C[K] extends IServiceResolver<infer S>
        ? S
        : C[K];
};
