import {IDisposable} from "@bunt/unit";
import {assert} from "@bunt/assert";
import {ITask, TaskPayload, TaskState} from "../../../src";
import {ITestTaskState} from "./TestTask";

export type TestPayload = [
    task: ITask,
    payload: ITestTaskState,
];

export type TaskLog = {
    task: ITask;
    payload: unknown;
};

export class TestQueue implements IDisposable {
    #disposed = false;

    readonly #tasks: TestPayload[] = [];
    readonly #logs: TaskLog[] = [];

    constructor(dataset: TestPayload[]) {
        for (const value of dataset) {
            this.#tasks.push(value);
        }
    }

    public get disposed(): boolean {
        return this.#disposed;
    }

    public find(id: number): TestPayload | undefined {
        return this.#tasks.find(([, p]) => p.id === id);
    }

    public next(): TaskPayload<any, any> | undefined {
        const next = this.#tasks.find(this.#filter);
        if (next) {
            const [task, payload] = next;

            return {task, payload};
        }
    }

    public finish(task: ITask, payload: ITestTaskState): void {
        const doc = this.#tasks.find(([, p]) => p.id = payload.id);
        assert(doc, "Unknown task");

        Object.assign(doc[0], task);

        this.#logs.push({task, payload});
    }

    public async dispose(): Promise<void> {
        this.#disposed = true;
    }

    #filter = ([task]: TestPayload): boolean => (
        task.state === TaskState.READY && task.runAt <= new Date()
    );
}
