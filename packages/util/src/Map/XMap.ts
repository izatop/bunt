import {assert} from "@bunt/assert";
import {isArray, isFunction} from "@bunt/is";

export type XMapArrayFactory<K, V> = (value: V, index: number, array: V[]) => K;
export type XMapInitializer<K, V> = (key: K) => V;
export type XMapArgs<K, V> = |
[values: [K, V][], initializer?: (key: K) => V] |
[initializer?: (key: K) => V];

export class XMap<K, V> extends Map<K, V> {
    readonly #initializer?: XMapInitializer<K, V>;

    constructor(...args: XMapArgs<K, V>) {
        super();
        const [valuesOr, initializer] = args;
        this.#initializer = initializer;

        if (isArray(valuesOr)) {
            valuesOr.forEach(([key, value]) => this.set(key, value));
            this.#initializer = initializer;
        }

        if (isFunction(valuesOr)) {
            this.#initializer = valuesOr;
        }
    }

    public static fromArray<K, V>(values: V[],
        key: XMapArrayFactory<K, V>,
        initializer?: XMapInitializer<K, V>): XMap<K, V> {
        return new XMap(
            values.map((value, index, array) => [key(value, index, array), value]),
            initializer,
        );
    }

    public static fromObject<T extends Record<any, any>, K extends keyof T>(values: T,
        initializer?: XMapInitializer<K, T[K]>): XMap<K, T[K]> {
        return new XMap<K, T[K]>(Object.entries(values) as [K, T[K]][], initializer);
    }

    public ensure(key: K): V;
    public ensure<NV extends V = V>(key: K, initializer: XMapInitializer<K, NV>): NV;
    public ensure(key: K, initializer: XMapInitializer<K, any> | undefined = this.#initializer): V {
        const exists = this.has(key);
        if (!exists && isFunction(initializer)) {
            const value = initializer(key);
            this.set(key, value);

            return value;
        }

        assert(exists, `The key doesn't exists: ${key}`);

        return this.get(key) as V;
    }

    public pick(key: K): V | undefined {
        const value = this.get(key);
        this.delete(key);

        return value;
    }
}
