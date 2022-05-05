import {dispose} from "@bunt/unit";
import {assert, throttle, wait, watch} from "@bunt/util";
import {Queue, RedisTransport, createConnection} from "../../src";
import {BarMessage} from "./Message/BarMessage";
import {TestTransaction} from "./Message/TestTransaction";

describe("Redis", () => {
    const dsn = "redis://localhost:6379";

    test("Q1", async () => {
        const res: number[] = [];
        const transport = new RedisTransport(dsn);
        const queue = new Queue(transport);
        const messages = [new BarMessage(1), new BarMessage(2), new BarMessage(3)];

        const op = queue.on(BarMessage, ({payload}) => res.push(payload));
        await Promise.all(messages.map((message) => queue.send(message)));

        await watch(3, throttle(() => res.length), 10);
        expect(res).toEqual([1, 2, 3]);
        expect(transport.connections).toBe(2);

        await dispose(op);
        expect(transport.connections).toBe(1);

        await dispose(queue);
        expect(transport.connections).toBe(0);

    });

    test("Q2", async () => {
        const res: any[] = [];
        const localDsn = dsn + "/?db=1";
        const redis = createConnection(localDsn);
        await redis.flushall();

        const transport = new RedisTransport(localDsn);
        const queue = new Queue(transport);

        const op = queue.on(TestTransaction, async ({payload}) => {
            res.push(payload);
            res.push(1 === await redis.llen(TestTransaction.getBackupKey()));
            assert(payload === 1);
        });

        expect(op.subscribed).toBe(true);

        queue.send(new TestTransaction(1));
        queue.send(new TestTransaction(2));

        await watch(4, throttle(() => res.length, 10));

        expect(await redis.llen(TestTransaction.getFallbackKey())).toBe(1);
        expect(res).toEqual([1, true, 2, true]);

        const close = wait((fn) => redis.once("end", fn));
        redis.disconnect();

        await close;
        await dispose(queue);

        expect(transport.connections).toBe(0);
    });
});
