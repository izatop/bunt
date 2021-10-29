import {ITransport} from "../interfaces";

export type PubSubChannel<K extends string | symbol | number = string> = Extract<K, string>
| [channel: Extract<K, string>, ...channelSubKeys: (string | number)[]];

export type SubscriptionManagerListener = (message: string) => unknown;
export type SubscriptionId<TRef = unknown> = {id: TRef; channel: string};

export interface ISubscriptionManager {
    subscribe(channel: string, listener: SubscriptionManagerListener): Promise<SubscriptionId>;
    unsubscribe(subscriptionId: SubscriptionId): Promise<void>;
}

export interface IPubSubTransport extends ITransport {
    publish(channel: string, message: string): Promise<number>;

    getSubscriptionManager(): Promise<ISubscriptionManager>;
}
