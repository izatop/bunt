import {safeMap} from "@bunt/util";
import {SubscriptionManagerListener} from ".";

export class SubscriptionList {
    readonly #listeners = new Set<SubscriptionManagerListener>();
    readonly channel: string;

    constructor(channel: string) {
        this.channel = channel;
    }

    public get count(): number {
        return this.#listeners.size;
    }

    public add(listener: SubscriptionManagerListener): this {
        this.#listeners.add(listener);

        return this;
    }

    public delete(listener: SubscriptionManagerListener): this {
        this.#listeners.delete(listener);

        return this;
    }

    public emit(message: string): this {
        safeMap(this.#listeners.values(), (listener) => listener(message));

        return this;
    }

    public dispose(): void {
        this.#listeners.clear();
    }
}
