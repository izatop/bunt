import {assert} from "@bunt/assert";
import {isDefined, isFunction} from "@bunt/is";

export type EnvRecord = Record<string, string>;

export class EnvReader<T extends EnvRecord> {
    readonly #map: Map<keyof T | string, string>;

    constructor(config: {[key: string]: string | undefined}) {
        this.#map = new Map(
            Object.entries(config)
                .map<[keyof T | string, string]>(([k, v]) => [k, v || ""]),
        );
    }

    public static from<T extends EnvRecord>(target: Partial<T>,
        ...envs: Record<string, string | undefined>[]): EnvReader<T> {
        for (const next of envs) {
            Object.assign(target, next);
        }

        return new this<T>(target);
    }

    public ensure<K extends keyof T>(key: K): string;
    public ensure<V>(key: string, parse: (v: string) => V): V;
    public ensure(key: string, parse?: (v: string) => unknown): unknown {
        const value = this.#map.get(key);
        assert(value, `The ${key} property should be defined`);

        return isFunction(parse) ? parse(value) : value;
    }

    public has<K extends keyof T>(key: K): boolean {
        return this.#map.has(key);
    }

    public get<K extends keyof T>(key: K): string;
    public get(key: string, defaultValue: string): string;
    public get<V>(key: string, parse: (v: string) => V): V;
    public get<V>(key: string, opt?: string | ((v: string) => V)): string | V {
        const value = this.#map.get(key);
        if (isDefined(value) && isFunction(opt)) {
            return opt(value);
        }

        return (value ?? opt) as string | V;
    }
}
