import {IDisposable} from "@bunt/unit";
import {assert, Defer, logger, Logger} from "@bunt/util";
import {SubscriptionId, SubscriptionListenerId, SubscriptionManagerListener} from "./interfaces";
import {SubscriptionList} from "./SubscriptionList";

export type SubscriptionManagerConfig = [list: SubscriptionList, state: Defer<void>];

export abstract class SubscriptionManager implements IDisposable {
    @logger
    declare protected readonly logger: Logger;

    readonly #subscriptions = new Map<string, SubscriptionManagerConfig>();

    public channels(): string[] {
        return [...this.#subscriptions.keys()];
    }

    public on(channel: string, listener: SubscriptionManagerListener): SubscriptionId {
        this.logger.debug("on(%s)", {channel});
        const config = this.#subscriptions.get(channel) ?? this.createSubscriptionRecord(channel);
        const [subscriptionList, pending] = config;

        if (!subscriptionList.count) {
            this.subscribe(channel)
                .then(pending.resolve, pending.reject);
        }

        subscriptionList.add(listener);

        return {channel, [SubscriptionListenerId]: listener};
    }

    public off(id: SubscriptionId): void {
        this.logger.debug("off(%o)", {id});
        const config = this.#subscriptions.get(id.channel);
        if (!config) {
            return;
        }

        const [subscriptionList] = config;
        subscriptionList.delete(id[SubscriptionListenerId]);

        if (!subscriptionList.count) {
            this.#subscriptions.delete(id.channel);
            this.unsubscribe(id.channel);
        }
    }

    public async ensure(channel: string): Promise<void> {
        this.logger.debug("ensure(%s)", {channel});
        const config = this.#subscriptions.get(channel);
        assert(config, `No active subscriptions found for channel ${channel}`);

        return config[1];
    }

    public async dispose(): Promise<void> {
        this.logger.debug("dispose(%d)", this.#subscriptions.size);
        for (const [channel, [subscriptionList]] of this.#subscriptions.entries()) {
            subscriptionList.dispose();
            await this.unsubscribe(channel);
        }

        this.#subscriptions.clear();
    }

    protected emit(channel: string, message: string): void {
        this.logger.debug("emit(%s, %s)", channel, message);
        const config = this.#subscriptions.get(channel);
        if (config) {
            const [subscriptionList] = config;
            subscriptionList.emit(message);
        }
    }

    protected createSubscriptionRecord(channel: string): SubscriptionManagerConfig {
        this.logger.debug("createSubscriptionRecord(%s)", channel);
        const config: SubscriptionManagerConfig = [new SubscriptionList(channel), new Defer()];
        this.#subscriptions.set(channel, config);

        return config;
    }

    protected abstract subscribe(channel: string): Promise<void>;
    protected abstract unsubscribe(channel: string): Promise<void>;
}
