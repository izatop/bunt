import {Defer} from "./Defer.js";

export type AsyncSingleCallFn = () => Promise<void>;

export class AsyncSingleCall {
    readonly #fn: AsyncSingleCallFn;
    #defer: Defer<void> | null = null;

    constructor(fn: AsyncSingleCallFn) {
        this.#fn = fn;
    }

    public call(): Defer<void> {
        if (!this.#defer) {
            const defer = new Defer<void>();
            this.#fn()
                .then(() => defer.resolve())
                .catch((reason) => defer.reject(reason))
                .finally(() => this.#defer = null);

            this.#defer = defer;
        }

        return this.#defer;
    }

    public wait(): Defer<void> | null {
        return this.#defer;
    }
}
