import {assert} from "../assert";
import {isFunction} from "../is";

export type XMapInitializer<K, V> = (key: K) => V;

export class XMap<K, V> extends Map<K, V> {
    readonly #initializer?: XMapInitializer<K, V>;

    constructor(initializer?: (key: K) => V) {
        super();
        this.#initializer = initializer;
    }

    public ensure(key: K, initializer: XMapInitializer<K, V> | undefined = this.#initializer): V {
        const exists = this.has(key);
        if (!exists && isFunction(initializer)) {
            const value = initializer(key);
            this.set(key, value);

            return value;
        }

        assert(exists, `The key doesn't exists: ${key}`);

        return this.get(key) as V;
    }
}
