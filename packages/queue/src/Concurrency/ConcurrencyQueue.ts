export class ConcurrencyQueue {
    readonly #queue = new Set<Promise<unknown>>();
    readonly #concurrency: number;

    constructor(concurrency: number) {
        this.#concurrency = concurrency;
    }

    public async enqueue(fn: () => Promise<unknown>): Promise<void> {
        const pending = fn();
        this.#queue.add(pending);
        pending.finally(() => this.#queue.delete(pending));

        if (this.#queue.size >= this.#concurrency) {
            await this.flush();
        }
    }

    public async flush(): Promise<void> {
        await Promise.allSettled(this.#queue.values());
    }
}
