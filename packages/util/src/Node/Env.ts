import {assert} from "../assert.js";
import {KeyOf} from "../interfaces.js";
import {Dict} from "./interfaces.js";

export type EnvValue = string | undefined;

export class Env<T extends Dict<string>> {
    readonly #store: Map<KeyOf<T>, EnvValue>;

    constructor(env: Dict<string>) {
        this.#store = new Map(Object.entries(env)) as Map<KeyOf<T>, EnvValue>;
    }

    public static factory<T extends Dict<string>>(env = process.env): Env<T> {
        return new this<T>(env);
    }

    public get<K extends KeyOf<T>>(key: K): string | undefined;
    public get<K extends KeyOf<T>>(key: K, defaultValue: string): string;
    public get<K extends KeyOf<T>>(key: K, defaultValue?: string): string | undefined {
        return this.#store.get(key) ?? defaultValue;
    }

    public ensure<K extends KeyOf<T>>(key: K): string;
    public ensure<V, K extends KeyOf<T>>(key: K, fn: (value: string) => V): V;
    public ensure<V, K extends KeyOf<T>>(key: K, fn?: (value: string) => V): string | V {
        const value = this.get(key);
        assert(value, `The key doesn't exists: ${key}`);

        return fn
            ? fn(value)
            : value;
    }

    public set<K extends KeyOf<T>>(key: K, override: string | undefined): this {
        this.#store.set(key, override);

        return this;
    }

    public as<V, K extends KeyOf<T>>(key: K, fn: (value: string) => V): V | undefined;
    public as<V, K extends KeyOf<T>>(key: K, fn: (value: string) => V, defaultValue: V): V;
    public as<V, K extends KeyOf<T>>(key: K, fn: (value: string) => V, defaultValue?: V): V | undefined {
        const value = this.get(key);

        return value
            ? fn(value)
            : defaultValue;
    }
}
