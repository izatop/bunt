import {Promisify} from "@bunt/type";

type LimiterTask = Promise<unknown>;

export abstract class LimiterAbstract {
    readonly #queue = new Set<LimiterTask>();

    public get queue(): LimiterTask[] {
        return [...this.#queue.values()];
    }

    public get size(): number {
        return this.#queue.size;
    }

    public async enqueue(task: LimiterTask): Promise<void> {
        this.#queue.add(task);
        task.finally(() => this.#queue.delete(task));

        await this.limit();
    }

    public abstract limit(): Promisify<void>;
}
