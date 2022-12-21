import {EventEmitter} from "events";

export type DeferOnFulfilled<T, TResult1> = ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null;
export type DeferOnRejected<TResult2> = ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null;
export type DeferState = "rejected" | "fulfilled" | "pending";

export class Defer<T> implements PromiseLike<T> {
    readonly #event = new EventEmitter();
    readonly #pending: Promise<T>;

    #state: DeferState = "pending";

    constructor() {
        this.#event.once("resolve", () => this.#state = "fulfilled");
        this.#event.once("reject", () => this.#state = "rejected");

        this.#pending = new Promise<T>((resolve, reject) => {
            this.#event.once("resolve", resolve);
            this.#event.once("reject", reject);
        });
    }

    public get state(): DeferState {
        return this.#state;
    }

    public get settled(): boolean {
        return this.#state !== "pending";
    }

    public get rejected(): boolean {
        return this.settled && this.#state === "rejected";
    }

    public get fulfilled(): boolean {
        return this.settled && this.#state === "fulfilled";
    }

    public then = <TResult1 = T, TResult2 = never>(onfulfilled?: DeferOnFulfilled<T, TResult1>,
        onrejected?: DeferOnRejected<TResult2>): PromiseLike<TResult1 | TResult2> => {
        return this.#pending.then(onfulfilled, onrejected);
    };

    public resolve = (value: T | PromiseLike<T>): void => {
        this.#event.emit("resolve", value);
    };

    public reject = (error: unknown): void => {
        this.#event.emit("reject", error);
    };
}
