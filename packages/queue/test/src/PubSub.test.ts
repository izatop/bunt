import {dispose} from "@bunt/unit";
import {PubSubChannel, PubSubSimple, RedisTransport} from "../../src";

describe.skip("PubSub", () => {
    test("Main", async () => {
        const channel: PubSubChannel<"foo"> = ["foo", 1];
        const transport = new RedisTransport("redis://127.0.0.1:6379");

        const pubSub = new PubSubSimple<{foo: string}>(transport);
        const subscription = await pubSub.subscribe(channel);
        const iterator = subscription.subscribe();

        const value = "bar";
        await expect(pubSub.publish(channel, value)).resolves.not.toThrow();
        for await (const item of iterator) {
            expect(item).toEqual(value);
            break;
        }

        const manager = await transport.getSubscriptionManager();
        expect(manager.getChannelKeys()).toEqual([]);
        expect(transport.connections).toBe(2);

        const s2 = await pubSub.subscribe(channel);
        const i2 = s2.subscribe();

        expect(transport.connections).toBe(2);

        i2.return(undefined);

        await dispose(pubSub);

        expect(transport.connections).toBe(0);
    });
});
