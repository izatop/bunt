import {Promisify} from "@bunt/type";
import {LimiterAbstract} from "./LimiterAbstract";

export class ConcurrencyLimiter extends LimiterAbstract {
    readonly #limit: number;

    constructor(limit: number) {
        super();

        this.#limit = limit;
    }

    public limit(): Promisify<void> {
        if (this.size < this.#limit) {
            return;
        }

        return Promise.allSettled(this.queue)
            .then(() => void 0);
    }
}
