import {assert} from "../assert.js";

const store = new WeakMap();

export class SingleRef<T> {
    readonly #ref: Record<any, any>;

    constructor(ref: Record<any, any> = {}) {
        this.#ref = ref;
    }

    public has(): boolean {
        return store.has(this.#ref);
    }

    public get(): T | undefined {
        return store.get(this.#ref);
    }

    public ensure(): T {
        const ref = this.get();
        assert(ref, "Unknown reference");

        return ref;
    }

    public once(fn: () => T): T {
        assert(!this.has(), "Cannot getting twice");

        return this.create(fn);
    }

    public create(fn: () => T): T {
        const value = store.get(this.#ref) ?? fn();
        if (!this.has()) {
            store.set(this.#ref, value);
        }

        return value;
    }
}
