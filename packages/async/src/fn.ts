import {Defer} from "./Defer.js";

export function timeout(timeout: number): Defer<void> {
    const defer = new Defer<void>();
    const timer = setTimeout(defer.resolve, timeout);
    defer.then(() => clearTimeout(timer));

    return defer;
}

export function wait<T = unknown>(fn: (re: (v: T) => void) => void): Promise<T> {
    return new Promise((resolve) => {
        fn(resolve);
    });
}

export async function watch<T>(expected: T, fn: () => Promise<T>, tries = Infinity): Promise<void> {
    while (tries-- > 0 && expected !== await fn()) {
        // nothing
    }
}

export function throttle<A extends any[], R>(fn: (...args: A) => R, t = 100): (...args: A) => Promise<R> {
    return async (...args: A): Promise<R> => {
        await timeout(t);

        return fn(...args);
    };
}

export async function all<P = unknown>(pending: Promise<P>[]): Promise<P[]> {
    return Promise.all(pending);
}

export function allSettled<T extends readonly unknown[] | []>(pending: T)
    : Promise<{-readonly [P in keyof T]: PromiseSettledResult<Awaited<T[P]>>}> {
    return Promise.allSettled(pending);
}

export function toAsync<A extends any[], R>(fn: (...args: A) => R): (...args: A) => Promise<R> {
    return async (...args: A): Promise<R> => {
        return fn(...args);
    };
}

export async function asyncCall<A extends any[], R>(fn: (...args: A) => R, ...args: A): Promise<R> {
    return fn(...args);
}
