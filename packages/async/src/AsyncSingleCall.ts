import {Defer} from "./Defer.js";

export type AsyncSingleCallFn = () => Promise<void> | void;

export class AsyncSingleCall {
    readonly #fn: AsyncSingleCallFn;
    #defer: Defer<void> | null = null;

    constructor(fn: AsyncSingleCallFn) {
        this.#fn = fn;
    }

    public call = (): Defer<void> => {
        if (!this.#defer) {
            this.#defer = new Defer<void>();
            const {resolve, reject} = this.#defer;

            Promise.resolve(this.#fn())
                .then(resolve)
                .catch(reject)
                .finally(() => this.#defer = null);
        }

        return this.#defer;
    };

    public wait = (): Defer<void> | null => {
        return this.#defer;
    };
}
