import {AsyncCallback} from "@bunt/util";
import {ISubscriptionManager} from "./interfaces";

export class Subscription<T> implements AsyncIterable<T> {
    public readonly channel: string;

    readonly #parser: (message: string) => T;
    readonly #manager: ISubscriptionManager;
    readonly #subscriptions = new Set<AsyncCallback<T>>();

    constructor(channel: string, manager: ISubscriptionManager, parser: (message: string) => T) {
        this.channel = channel;
        this.#manager = manager;
        this.#parser = parser;
    }

    public async *subscribe(): AsyncGenerator<T> {
        return this[Symbol.asyncIterator];
    }

    public async unsubscribe() {
        for (const iterator of this.#subscriptions.values()) {
            iterator.dispose();
        }
    }

    public async* [Symbol.asyncIterator](): AsyncGenerator<T> {
        const generator = new SubscriptionGenerator<T>();
        const id = await this.#manager.subscribe(
            this.channel,
            (message) => generator.push(this.#parser(message)),
        );

        generator.stop = async () => {
            await this.#manager.unsubscribe(id);
        };

        return generator;
    }
}

class SubscriptionGenerator<T, TNext = unknown> implements AsyncGenerator<T, undefined, TNext> {
    readonly #queue: Defer<T | undefined>[] = [];
    #done = false;

    public pull(): Defer<T | undefined> {
        const pending = new Defer<T | undefined>();
        this.#queue.push(pending);

        return pending;
    }

    public push(value: T | undefined): void {
        this.#queue.splice(0, this.#queue.length)
            .forEach((pending) => pending.resolve(value));
    }

    public async next(): Promise<IteratorResult<T, undefined>> {
        const value = await this.pull();
        if (value) {
            return {value};
        }

        return {value: undefined, done: true};
    }

    public async return(): Promise<IteratorResult<T, undefined>> {
        this.close();

        return {value: undefined, done: true};
    }

    public async throw(): Promise<IteratorResult<T, undefined>> {
        this.close();

        return {value: undefined, done: true};
    }

    public [Symbol.asyncIterator](): AsyncGenerator<T, undefined, TNext> {
        return this;
    }

    public stop?(): unknown;

    private async close() {
        await this.stop?.();
        this.push(undefined);
    }
}

class Defer<T> extends Promise<T> {
    #resolve = (_value: T | PromiseLike<T>) => {
        // noop
    };

    #reject = (_error: Error) => {
        // noop
    };

    constructor() {
        super((resolve, reject) => {
            this.#resolve = resolve;
            this.#reject = reject;
        });
    }

    public resolve(value: T | PromiseLike<T>) {
        this.#resolve(value);
    }

    public reject(error: Error) {
        this.#reject(error);
    }
}
