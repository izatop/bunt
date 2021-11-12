import {EventEmitter} from "events";

type DeferOnFulfilled<T, TResult1> = ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null;
type DeferOnRejected<TResult2> = ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null;

export class Defer<T> implements PromiseLike<T> {
    readonly #event = new EventEmitter();
    readonly #pending: Promise<T>;

    #settled = false;

    constructor() {
        this.#event.on("resolve", () => this.#settled = true);
        this.#event.on("reject", () => this.#settled = true);

        this.#pending = new Promise<T>((resolve, reject) => {
            this.#event.on("resolve", resolve);
            this.#event.on("reject", reject);
        });
    }

    public get settled() {
        return this.#settled;
    }

    public then = <TResult1 = T, TResult2 = never>(onfulfilled?: DeferOnFulfilled<T, TResult1>,
        onrejected?: DeferOnRejected<TResult2>): PromiseLike<TResult1 | TResult2> => {
        return this.#pending.then(onfulfilled, onrejected);
    };

    public resolve = (value: T | PromiseLike<T>) => {
        this.#event.emit("resolve", value);
    };

    public reject = (error: Error) => {
        this.#event.emit("reject", error);
    };
}
