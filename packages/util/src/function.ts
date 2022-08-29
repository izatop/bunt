import {isArray} from "./is";
import {all} from "./Async";
import {Promisify} from "./interfaces";

export const noop = (..._args: any[]): void => void 0;

export function not<A extends any[]>(fn: (...args: A) => boolean) {
    return (...args: A): boolean => {
        return !fn(...args);
    };
}

export function curry<A extends any[], T, S>(fn: (arg1: T, ...args: A) => S, value: T) {
    return (...args: A): S => {
        return fn(value, ...args);
    };
}

export function makeSafe<A extends any[], R>(fn: (...args: A) => Promise<R>) {
    return async (...args: A): Promise<R | undefined> => {
        try {
            return await fn(...args);
        } catch (error) {
            // do something
        }
    };
}

export type ValueToArray<T> = T extends any[] ? T : T[];

export function toArray<T>(value: T): ValueToArray<T> {
    if (isArray(value)) {
        return value as ValueToArray<T>;
    }

    return [value] as ValueToArray<T>;
}


export function voidify<T extends Promise<unknown>>(value: T): Promise<void> {
    return value.then(() => undefined);
}

export async function safeMap<T>(values: Iterable<T>, fn: (value: T) => Promisify<any>): Promise<unknown[]> {
    const result: Promise<unknown>[] = [];
    for (const value of values) {
        try {
            result.push(await fn(value));
        } catch (error) {
            result.push(Promise.resolve(undefined));
        }
    }

    return all(result);
}
