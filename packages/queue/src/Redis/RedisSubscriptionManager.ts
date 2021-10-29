import {IDisposable} from "@bunt/unit";
import {toError, wait} from "@bunt/util";
import {Redis} from "ioredis";
import {ISubscriptionManager, SubscriptionManagerListener, SubscriptionId} from "../PubSub";

export class RedisSubscriptionManager implements ISubscriptionManager, IDisposable {
    readonly #subscriptions = new Map<string, Set<SubscriptionManagerListener>>();
    readonly #connection: Redis;

    constructor(connection: Redis) {
        this.#connection = connection;
        this.#connection.addListener("message", (channel, message) => {
            this.handle(channel, message);
        });
    }

    public getChannelKeys() {
        return [...this.#subscriptions.keys()];
    }

    public async subscribe(channel: string,
        listener: SubscriptionManagerListener): Promise<SubscriptionId<SubscriptionManagerListener>> {
        const list = await this.getChannelList(channel);
        list.add(listener);

        return {id: listener, channel};
    }

    public async unsubscribe(id: SubscriptionId<SubscriptionManagerListener>): Promise<void> {
        const list = await this.getChannelList(id.channel);
        list.delete(id.id);

        if (!list.size) {
            this.#subscriptions.delete(id.channel);
            await this.#connection.unsubscribe(id.channel);
        }
    }

    public async dispose(): Promise<void> {
        for (const channel of this.#subscriptions.keys()) {
            await this.#connection.unsubscribe(channel);
        }

        this.#subscriptions.clear();
        await wait((fn) => this.#connection.once("close", fn).disconnect());
    }

    private async handle(channel: string, message: string): Promise<void> {
        const subscriptions = this.#subscriptions.get(channel) ?? [];
        for (const subscription of subscriptions) {
            try {
                await Promise.resolve(subscription(message));
            } catch (error) {
                // eslint-disable-next-line
                console.error(toError(error, "Unexpected error"));
            }
        }
    }

    private async getChannelList(channel: string): Promise<Set<SubscriptionManagerListener>> {
        const list = this.#subscriptions.get(channel) ?? new Set();

        if (!list.size) {
            await this.#connection.subscribe(channel);
        }

        if (!this.#subscriptions.has(channel)) {
            this.#subscriptions.set(channel, list);
        }

        return list;
    }
}
