import {IDisposable} from "@bunt/unit";
import {TaskPollDispose, TaskPoll, TaskPayload} from "./interfaces";

export class TaskIterator<S extends Record<any, any>> implements AsyncIterableIterator<TaskPayload<S>>, IDisposable {
    readonly #poll: TaskPoll<TaskPayload<S>>;
    readonly #dispose: TaskPollDispose;

    #current: TaskPayload<S> | undefined;

    constructor(poll: TaskPoll<TaskPayload<S>>, dispose: TaskPollDispose) {
        this.#poll = poll;
        this.#dispose = dispose;
    }

    public async next(): Promise<IteratorResult<TaskPayload<S>, TaskPayload<S> | undefined>> {
        this.#current = await this.#poll();

        if (!this.#current) {
            return this.return();
        }

        return {value: this.#current, done: false};
    }

    public async return(): Promise<IteratorResult<TaskPayload<S>, TaskPayload<S> | undefined>> {
        await this.dispose();

        return {done: true, value: undefined};
    }

    public async dispose(): Promise<void> {
        await this.#dispose();
    }

    [Symbol.asyncIterator](): AsyncIterableIterator<TaskPayload<S>> {
        return this;
    }
}
