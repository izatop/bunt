import {isUndefined} from "@bunt/util";
import {AsyncPool} from "./AsyncPool.js";

export type AsyncIteratorFactoryControl<T> = {
    push(value: T): void;
    on(dispose: () => Promise<void>): void;
};

export type AsyncIteratorFactoryFunction<T> = (control: AsyncIteratorFactoryControl<T>) => Promise<void>;

export class AsyncIteratorFactory<T> implements AsyncIterable<T> {
    readonly #pool = new AsyncPool<T | undefined>();
    readonly #factory: AsyncIteratorFactoryFunction<T>;

    constructor(factory: AsyncIteratorFactoryFunction<T>) {
        this.#factory = factory;
    }

    public [Symbol.asyncIterator](): AsyncIterator<T> {
        let disposer: {(): void} | undefined;

        this.#factory({
            on: (dispose) => disposer = dispose,
            push: (value) => this.#pool.push(value),
        })
            .then(() => this.#pool.push(undefined))
            .catch((reason) => this.#pool.reject(reason));

        return {
            next: (): Promise<IteratorResult<T>> => this.#pool.pull().then(this.#format),
            return: async (value?: T | PromiseLike<T>): Promise<IteratorResult<T>> => {
                disposer?.();

                return Promise.resolve(value).then(this.#format);
            },
            throw: async (e): Promise<IteratorResult<T>> => {
                disposer?.();

                return Promise.reject(e);
            },
        };
    }

    public getAsyncIterator(): AsyncIterator<T> {
        return this[Symbol.asyncIterator]();
    }

    #format(value?: T): IteratorResult<T> {
        return isUndefined(value) ? {value, done: true} : {value, done: false};
    }
}
