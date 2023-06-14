import {assert} from "@bunt/assert";
import {Defer} from "./Defer.js";

export interface IAsyncPushPullOptions {
    length?: number;
}

export class AsyncPool<T> {
    readonly #buffer: T[] = [];
    readonly #maxBufferSize: number;

    #pending: Defer<T> | null = null;

    constructor(maxBufferSize?: number) {
        this.#maxBufferSize = maxBufferSize ?? Infinity;
    }

    public reject(reason: unknown): void {
        assert(!this.#pending?.settled, `Failed to call reject in ${this.#pending?.state} state`);

        this.#pending = this.#pending || new Defer();
        this.#pending.reject(reason);
    }

    public push(value: T): void {
        assert(!this.#pending?.settled, `Failed to call push in ${this.#pending?.state} state`);

        if (this.#pending) {
            this.#pending.resolve(value);
            this.#pending = null;

            return;
        }

        assert(this.#buffer.length < this.#maxBufferSize, "Buffer reached size limit");

        this.#buffer.push(value);
    }

    public async pull(): Promise<T | undefined> {
        if (this.#buffer.length) {
            return this.#buffer.shift() as T;
        }

        if (this.#pending?.settled) {
            return this.#pending;
        }

        return this.#pending = this.#pending || new Defer();
    }
}
