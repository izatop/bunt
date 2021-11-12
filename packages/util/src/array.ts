import {all} from "./Async";
import {Promisify} from "./interfaces";

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
