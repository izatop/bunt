import {assert} from "@bunt/assert";
import {
    ConcurrencyLimiter,
    FixedWindowLimiter,
    ITaskDone,
    ITaskReject,
    ITaskResult,
    ITaskSchedule,
    TaskState,
} from "../../src";
import {TestContext} from "./app/TestContext";
import {TestPayload, TestQueue} from "./app/TestQueue";
import {TestRunner} from "./app/TestRunner";
import TestTask from "./app/TestTask";

const pending: {(): void}[] = [];
const add = (): Promise<void> => new Promise((res) => pending.push(res));

describe("Task", () => {
    test("Runner", async () => {
        const dataset: TestPayload[] = [
            [
                {state: 0, runAt: new Date()},
                {id: 1, value: 1},
            ],
        ];

        const queue = new TestQueue(dataset);
        const runner = await TestRunner.factory(new TestContext(queue), {polling: false});
        runner.register(TestTask);
        await runner.handle();

        expect(queue.find(1)?.[0].state).toBe(TaskState.DONE);
        expect(queue.disposed).toBe(true);
    });

    test("Runner.enqueue", async () => {
        const dataset: TestPayload[] = [
            [
                {state: 0, runAt: new Date()},
                {id: 1, value: 1},
            ],
        ];

        const queue = new TestQueue(dataset);
        const runner = await TestRunner.factory(new TestContext(queue), {polling: false});

        const iterator = await TestTask.factory(runner.context);
        const payload = await iterator.next();
        expect(payload.value).toBeDefined();

        assert(payload.value);
        await runner.enqueue(TestTask, payload.value);
        expect(queue.find(1)?.[0].state).toBe(TaskState.DONE);

        await expect(iterator.next()).resolves.toEqual({done: true});
        expect(queue.disposed).toBe(true);
    });

    test("Runner.getTaskUpgradeState", async () => {
        const queue = new TestQueue([]);
        const runner = await TestRunner.factory(new TestContext(queue));

        const result = "done";
        const date = new Date("2000-01-01T00:00:00.000Z");

        const schedule: ITaskSchedule = {
            date,
            result,
            state: TaskState.READY,
            reason: "ok",
        };

        const rejected: ITaskReject = {
            state: TaskState.REJECTED,
            reason: "Unexpected error",
        };

        const done: ITaskDone = {
            result,
            state: TaskState.DONE,
        };

        const simple: ITaskResult = {result, reason: "success"};

        expect(runner.getTaskUpgradeState(schedule)).toMatchSnapshot();
        expect(runner.getTaskUpgradeState(rejected)).toMatchSnapshot();
        expect(runner.getTaskUpgradeState(done)).toMatchSnapshot();
        expect(runner.getTaskUpgradeState(simple)).toMatchSnapshot();
        expect(runner.getTaskUpgradeState()).toMatchSnapshot();
    });

    test("ConcurrencyLimiter", async () => {
        const dataset = [[1, void 0], [2, Promise.resolve()]];
        const limiter = new ConcurrencyLimiter(2);
        for (const [value, ret] of dataset) {
            limiter.enqueue(add());
            expect(limiter.size).toBe(value);
            expect(limiter.limit()).toEqual(ret);
        }

        const limitedPromise = limiter.limit();
        pending.forEach((fn) => fn());

        await expect(limitedPromise).resolves.toBeUndefined();
    });

    test("FixedWindowLimiter", async () => {
        const dataset = [[1, void 0], [2, Promise.resolve()]];
        const limiter = new FixedWindowLimiter(10, 2, 10);
        for (const [value, ret] of dataset) {
            limiter.enqueue(add());
            expect(limiter.size).toBe(value);
            expect(limiter.limit()).toEqual(ret);
        }

        const limitedPromise = limiter.limit();
        pending.forEach((fn) => fn());

        await expect(limitedPromise).resolves.toBeUndefined();
    });
});
