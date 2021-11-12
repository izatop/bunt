import {Disposable} from "@bunt/unit";
import {all} from "@bunt/util";
import {SubscriptionManager} from "./SubscriptionManager";
import {SubscriptionIterator} from "./SubscriptionIterator";

export class Subscription<T> implements AsyncIterable<T>, Disposable {
    public readonly channel: string;

    readonly #parser: (message: string) => T;
    readonly #manager: SubscriptionManager;
    readonly #subscriptions = new Set<SubscriptionIterator<T>>();

    constructor(channel: string, manager: SubscriptionManager, parser: (message: string) => T) {
        this.channel = channel;
        this.#manager = manager;
        this.#parser = parser;
    }

    public get size() {
        return this.#subscriptions.size;
    }

    public ensure(): Promise<void> {
        return this.#manager.ensure(this.channel);
    }

    /**
     * Unsubscribe all active subscriptions
     */
    public async unsubscribe() {
        const pending: Promise<void>[] = [];
        for (const iterator of this.#subscriptions.values()) {
            pending.push(iterator.destroy());
        }

        await all(pending);
    }

    public [Symbol.asyncIterator](): SubscriptionIterator<T> {
        const iterator = new SubscriptionIterator<T>();
        const id = this.#manager.on(
            this.channel,
            (message) => iterator.push(this.#parser(message)),
        );

        iterator.unsubscribe(() => {
            this.#manager.off(id);
            this.#subscriptions.delete(iterator);
        });

        this.#subscriptions.add(iterator);

        return iterator;
    }

    public async dispose() {
        await this.unsubscribe();
    }
}
