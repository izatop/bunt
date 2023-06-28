import {Promisify} from "@bunt/type";
import {assert} from "@bunt/assert";
import {timeout} from "@bunt/async";
import {LimiterAbstract} from "./LimiterAbstract.js";

export class FixedWindowLimiter extends LimiterAbstract {
    readonly #limit: number;
    readonly #windowMs: number;
    readonly #frame: number;
    #frames: {time: number; count: number}[];

    constructor(windowMs: number, limit: number, lower = 1000) {
        super();
        assert(windowMs > 0, "Window ms should be greater than zero", {windowMs, limit});

        this.#frame = windowMs / limit < lower ? lower : Math.ceil(windowMs / limit);
        this.#frames = [{count: 0, time: Date.now()}];
        this.#windowMs = windowMs;
        this.#limit = limit;
    }

    public override async enqueue(task: Promise<unknown>): Promise<void> {
        this.#increase();
        await super.enqueue(task);
    }

    public limit(): Promisify<void> {
        this.#recap();

        const count = this.#frames.reduce((l, {count}) => l + count, 0);
        if (count < this.#limit) {
            return;
        }

        const pending = timeout(this.#frame);

        return pending.then(() => Promise.resolve(this.limit()));
    }

    #increase(): void {
        this.#frames[this.#frames.length - 1].count += 1;
    }

    #recap(): void {
        const now = Date.now();
        const minWindowTime = now - this.#windowMs;
        const minFrameTime = now - this.#frame;

        const [earliestFrame] = this.#frames;
        if (earliestFrame && earliestFrame.time < minWindowTime) {
            const found = this.#frames.filter(({time}) => time < minWindowTime);
            this.#frames.splice(0, found.length);
        }

        const latestFrame = this.#frames[this.#frames.length - 1];
        if (!latestFrame || latestFrame.time < minFrameTime) {
            this.#frames.push({count: 0, time: Date.now()});
        }
    }
}
