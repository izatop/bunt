import {Defer} from ".";

export interface IAsyncPushPullOptions {
    length?: number;
    buffered?: boolean;
}

export class AsyncPushPull<T> {
    readonly #buffer: T[] = [];
    readonly #buffered: boolean;
    readonly #length: number;

    #pending: Defer<T | undefined> | null = null;

    constructor(options: IAsyncPushPullOptions = {}) {
        this.#length = options.length ?? 1000;
        this.#buffered = options.buffered ?? true;
    }

    public push(value: T): void {
        if (this.#pending?.settled) {
            // eslint-disable-next-line
            console.warn(`AsyncPushPull.push failed call in destroyed state`);
            return;
        }

        if (this.#pending) {
            this.#pending.resolve(value);
            this.#pending = null;
            return;
        }

        if (this.#buffered) {
            if (this.#buffer.length > this.#length) {
                // eslint-disable-next-line
                console.warn(`AsyncPushPull.buffer reach maximum queue length, drop last one`);
                this.#buffer.splice(-this.#length);
            }

            this.#buffer.push(value);
        }
    }

    public async pull(): Promise<T | undefined> {
        if (this.#buffer.length) {
            return this.#buffer.shift() as T;
        }

        return this.#pending = new Defer();
    }

    public destroy() {
        if (this.#pending) {
            this.#pending.resolve(undefined);
        }
    }
}
