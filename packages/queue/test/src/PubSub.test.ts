import {dispose} from "@bunt/unit";
import {PubSubChannel, PubSubSimple, RedisTransport} from "../../src";

describe.skip("PubSub", () => {
    test("Main", async () => {
        const channel: PubSubChannel<"foo"> = ["foo", 1];
        const transport = new RedisTransport("redis://127.0.0.1:6379");
        const pubSub = new PubSubSimple<{ foo: string }, RedisTransport>(transport);
        const subscribe = await pubSub.subscribe(channel);
        const iterator = subscribe[Symbol.asyncIterator]();
        await expect(pubSub.publish(channel, "bar")).resolves.not.toThrow();
        await expect(iterator.next()).resolves.toEqual({value: "bar", done: false});
        await dispose(pubSub);
    });
});
