import {IDisposable} from "@bunt/unit";
import {Defer} from "@bunt/util";
import {ConcurrencyQueue} from "./ConcurrencyQueue";

export class RateLimitedQueue extends ConcurrencyQueue implements IDisposable {
    readonly #slots: PromiseLike<void>[] = [];
    readonly #pending: Defer<void>[] = [];
    readonly #limit: number;
    readonly #timer: NodeJS.Timer;

    constructor(concurrency: number, limit: number, windowMs: number) {
        super(concurrency);
        this.#limit = limit;
        this.#fill(this.#limit);

        this.#timer = setInterval(() => this.#refresh(), windowMs);
    }

    public async enqueue(fn: () => Promise<unknown>): Promise<void> {
        await this.#throttle();
        await super.enqueue(fn);
    }

    public async dispose(): Promise<void> {
        this.#resolve();
        this.#slots.splice(0, this.#slots.length);
        clearInterval(this.#timer);
    }

    #refresh(): void {
        const slotsCount = (this.#slots.length + this.#pending.length);
        const freeSlots = this.#limit - slotsCount;
        this.#resolve();

        this.#fill(freeSlots);
    }

    #throttle(): PromiseLike<void> {
        const slot = this.#slots.pop();
        if (slot) {
            return slot;
        }

        const defer = new Defer<void>();
        this.#pending.push(defer);

        return defer;
    }

    #resolve(): void {
        this.#pending.splice(0, this.#pending.length)
            .forEach((defer) => defer.resolve());
    }

    #fill(slotCount: number): void {
        this.#slots.push(
            ...new Array(slotCount)
                .fill(Promise.resolve()),
        );
    }
}
