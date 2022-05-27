import {assert} from "../assert";

export class XMap<K, V> extends Map<K, V> {
    readonly #initializer?: (key: K) => V;

    constructor(initializer?: (key: K) => V) {
        super();
        this.#initializer = initializer;
    }

    public ensure(key: K, initializer?: (key: K) => V): V {
        initializer = initializer ?? this.#initializer;

        const value = this.get(key);
        const exists = this.has(key);
        if (!exists && initializer) {
            const value = initializer(key);
            this.set(key, value);

            return value;
        }

        assert(!exists, `No value of key ${key}`);

        return value as V;
    }
}
