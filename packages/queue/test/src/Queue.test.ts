import {Disposer} from "@typesafeunit/unit";
import {wait} from "../../../util/src";
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
        const sub1 = queue.subscribe(FooMessage, (message) => success.push(message));

        expect(sub1.subscribed).toBe(true);
        await expect(sub1.subscribe()).rejects.toThrow();
        await expect(sub1.unsubscribe()).resolves.toBeUndefined();

        queue.send(new FooMessage(true));
        await sub1.subscribe();

        expect(success).toMatchSnapshot();

        await Disposer.dispose(queue);
    });

    test("Rejection", async () => {
        const rejections: any[] = [];
        const queue = new Queue(new TestTransport());

        queue.send(new BarMessage(1));
        const sub = queue.subscribe(BarMessage, () => {
            throw new Error("Test Error");
        });

        sub.watch(({error, status, message}) => {
            rejections.push({error, status, message});
        });

        await sub.unsubscribe();
        expect(rejections.length).toBe(1);
        expect(rejections[0].status).toBe(false);
        expect(rejections).toMatchSnapshot();

        await Disposer.dispose(queue);
    });

    test("Task", async () => {
        const queue = new Queue(new TestTransport());
        const calc = [10, 5, 3];
        queue.send(new MultiplyTask(calc));
        queue.subscribe(MultiplyTask, ({payload}) => {
            return payload.reduce((l, r) => l + r, 0);
        });

        const reply = await wait<NumMessage>((resolve) => {
            queue.subscribe(NumMessage, (message) => resolve(message));
        });

        expect(reply.payload).toBe(calc.reduce((l, r) => l + r, 0));

        await Disposer.dispose(queue);
    });
});
