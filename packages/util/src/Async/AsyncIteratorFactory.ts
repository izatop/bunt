import {bind} from "../decorator";
import {isUndefined} from "../is";
import {AsyncPushPull} from "./AsyncPushPull";

type AsyncIteratorFactoryFunction<T> = {
    (
        push: (value: T) => void,
        reject: (reason: unknown) => void,
        on: (dispose: () => Promise<void>) => void,
    ): Promise<void>;
};

export class AsyncIteratorFactory<T> implements AsyncIterable<T> {
    readonly #pool: AsyncPushPull<T>;
    readonly #disposable: {(): void}[] = [];

    constructor(factory: AsyncIteratorFactoryFunction<T>) {
        this.#pool = new AsyncPushPull();
        factory(
            (value) => this.#pool.push(value),
            (reason) => this.#pool.reject(reason),
            (dispose) => this.#disposable.push(dispose),
        )
            .catch(this.reject);
    }

    public reject(reason: unknown): void {
        this.#pool.reject(reason);
    }

    public [Symbol.asyncIterator](): AsyncIterator<T> {
        return {
            next: async (): Promise<IteratorResult<T>> => {
                return this.#pool.pull()
                    .then(this.asResult);
            },
            return: async (value?: T | PromiseLike<T>): Promise<IteratorResult<T>> => {
                await this.dispose();

                return Promise.resolve(value)
                    .then(this.asResult);
            },
            throw: async (e): Promise<IteratorResult<T>> => {
                await this.dispose();

                return Promise.reject(e);
            },
        };
    }

    public getAsyncIterator(): AsyncIterator<T> {
        return this[Symbol.asyncIterator]();
    }

    public async dispose(): Promise<void> {
        const pending = this.#disposable.map((fn) => Promise.resolve(fn()));

        return Promise
            .all(pending)
            .then(() => void 0);
    }

    @bind
    private asResult(value?: T): IteratorResult<T> {
        return isUndefined(value) ? {value, done: true} : {value, done: false};
    }
}
