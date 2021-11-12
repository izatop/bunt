import {dispose} from "@bunt/unit";
import {PubSubChannel, PubSubSimple, RedisTransport} from "../../src";

describe("PubSub", () => {
    test("Main", async () => {
        const value = {bar: "baz"};
        const channel: PubSubChannel<"foo"> = ["foo", 123];
        const transport = new RedisTransport();
        const pubSub = new PubSubSimple<{foo: {bar: string}}>(transport);

        const subscription = await pubSub.subscribe(channel);
        expect(subscription.channel).toBe(pubSub.key(channel));
        const iterator = subscription[Symbol.asyncIterator]();

        await subscription.ensure();
        await expect(pubSub.publish(channel, value)).resolves.not.toThrow();
        await expect(iterator.next()).resolves.toEqual({value, done: false});

        const manager = await transport.getSubscriptionManager();
        expect(manager.channels()).toEqual([pubSub.key(channel)]);
        expect(transport.connections).toBe(2);

        await dispose(pubSub);

        expect(transport.connections).toBe(0);
    });
});
