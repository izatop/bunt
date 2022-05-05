import {assert} from "../assert";
import {Dict} from "./interfaces";

export type EnvKey = string | number | symbol;
export type EnvDefaultValue = string | undefined;

export class Env<T extends Dict<string>> {
    readonly #store: Map<keyof T, EnvDefaultValue>;

    constructor(env: Dict<string>) {
        this.#store = new Map(Object.entries(env));
    }

    public static factory<T extends Dict<string>>(env = process.env): Env<T> {
        return new this<T>(env);
    }

    public get<K extends keyof T>(key: K): string | undefined;
    public get<K extends keyof T>(key: K, defaultValue: string): string;
    public get<K extends keyof T>(key: K, defaultValue?: string): string | undefined {
        return this.#store.get(key) ?? defaultValue;
    }

    public ensure<K extends keyof T>(key: K): string;
    public ensure<V, K extends keyof T>(key: K, fn: (value: string) => V): V;
    public ensure<V, K extends keyof T>(key: K, fn?: (value: string) => V): string | V {
        const value = this.get(key);
        assert(value, `The key '${key}'' must be provided in runtime environment`);

        return fn
            ? fn(value)
            : value;
    }

    public set<K extends keyof T>(key: K, override: string | undefined): this {
        this.#store.set(key, override);

        return this;
    }

    public as<V, K extends keyof T>(key: K, fn: (value: string) => V): V | undefined;
    public as<V, K extends keyof T>(key: K, fn: (value: string) => V, defaultValue: V): V;
    public as<V, K extends keyof T>(key: K, fn: (value: string) => V, defaultValue?: V): V | undefined {
        const value = this.get(key);

        return value
            ? fn(value)
            : defaultValue;
    }
}
