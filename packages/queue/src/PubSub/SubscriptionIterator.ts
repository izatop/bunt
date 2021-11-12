import {AsyncPushPull, isUndefined, Promisify} from "@bunt/util";

export class SubscriptionIterator<T, TNext = unknown> extends AsyncPushPull<T | undefined>
    implements AsyncIterator<T, undefined, TNext> {
    #unsubscribe?: () => Promisify<void>;

    #done = false;

    public async next(): Promise<IteratorResult<T, undefined>> {
        const value = await this.pull();
        if (isUndefined(value)) {
            return {value, done: true};
        }

        return {value, done: false};
    }

    public async return(): Promise<IteratorResult<T, undefined>> {
        this.destroy();

        return {value: undefined, done: true};
    }

    public async throw(): Promise<IteratorResult<T, undefined>> {
        this.destroy();

        return {value: undefined, done: true};
    }

    public unsubscribe(fn: () => Promisify<void>): void {
        this.#unsubscribe = fn;
    }

    public async destroy() {
        await this.#unsubscribe?.();
        super.destroy();
    }
}
