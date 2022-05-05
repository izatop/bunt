import {dispose} from "@bunt/unit";
import {wait} from "@bunt/util";
import {Queue} from "../../src";
import {BarMessage} from "./Message/BarMessage";
import {FooMessage} from "./Message/FooMessage";
import {MultiplyTask} from "./Message/MultiplyTask";
import {NumMessage} from "./Message/NumMessage";
import {TestTransport} from "./Queue/TestTransport";

describe("Queue", () => {
    test("Subscription", async () => {
        const success: FooMessage[] = [];
        const queue = new Queue(new TestTransport());
        const sub1 = queue.on(FooMessage, (message) => success.push(message));

        expect(sub1.subscribed).toBe(true);
        await expect(sub1.subscribe()).rejects.toThrow();
        await expect(sub1.unsubscribe()).resolves.toBeUndefined();

        queue.send(new FooMessage(true));
        await sub1.subscribe();

        expect(success).toMatchSnapshot();

        await dispose(queue);
    });

    test("Rejection", async () => {
        const rejections: any[] = [];
        const queue = new Queue(new TestTransport());

        queue.send(new BarMessage(1));
        const sub = queue.on(BarMessage, () => {
            throw new Error("Test Error");
        });

        sub.watch(({error, status, message}) => {
            rejections.push({error, status, message});
        });

        await sub.unsubscribe();
        expect(rejections.length).toBe(1);
        expect(rejections[0].status).toBe(false);
        expect(rejections).toMatchSnapshot();

        await dispose(queue);
    });

    test("Task", async () => {
        const queue = new Queue(new TestTransport());
        const calc = [10, 5, 3];
        queue.send(new MultiplyTask(calc));
        queue.on(MultiplyTask, ({payload}) => {
            return payload.reduce((l, r) => l + r, 0);
        });

        const reply = await wait<NumMessage>((resolve) => {
            queue.on(NumMessage, (message) => resolve(message));
        });

        expect(reply.payload).toBe(calc.reduce((l, r) => l + r, 0));

        await dispose(queue);
    });
});
