import {SubscriptionManager} from ".";
import {ITransport} from "../interfaces";

export const SubscriptionListenerId = Symbol.for("SubscriptionListenerId");

export type PubSubChannel<K extends string | symbol | number = string> = Extract<K, string>
| [channel: Extract<K, string>, ...channelSubKeys: (string | number)[]];

export type SubscriptionManagerListener = (message: string) => unknown;

export type SubscriptionId = {
    channel: string;
    [SubscriptionListenerId]: SubscriptionManagerListener;
};

export interface IPubSubTransport extends ITransport {
    publish(channel: string, message: string): Promise<void>;

    getSubscriptionManager(): Promise<SubscriptionManager>;
}
