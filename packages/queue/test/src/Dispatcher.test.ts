import {Context, dispose} from "@bunt/unit";
import {wait} from "@bunt/util";
import {Dispatcher, Queue} from "../../src";
import {HelloAsk} from "./Dispatcher/HelloAsk";
import {HelloHandler} from "./Dispatcher/HelloHandler";
import {HelloReply} from "./Dispatcher/HelloReply";
import {TestTransport} from "./Queue/TestTransport";

describe("Dispatcher", () => {
    const queue = new Queue(new TestTransport());
    test("Test", async () => {
        const dispatcher = await Dispatcher.factory(new Context(), queue);
        dispatcher.subscribe(HelloAsk, HelloHandler);

        queue.send(new HelloAsk("Test"));
        const reply = await wait<string>((resolve) => queue.subscribe(HelloReply, ({payload}) => {
            resolve(payload);
        }));

        expect(reply).toBe("Hello, Test");

        const heartbeat = dispatcher.getHeartbeat();
        await dispose(dispatcher);

        await expect(heartbeat.watch()).resolves.toBeUndefined();
    });
});
