import {isArray} from "@bunt/is";
import {IKeyValueMap} from "../interfaces.js";

export class KeyValueMap implements IKeyValueMap {
    readonly #map: Map<string, string>;

    constructor(values: [string, string][]) {
        this.#map = new Map(values);
    }

    public static fromObject(input: Record<string, string>): IKeyValueMap {
        return new this(Object.entries(input));
    }

    public delete(name: string): void {
        this.#map.delete(name);
    }

    public entries(): [string, string][] {
        return [...this.#map.entries()];
    }

    public has(name: string): boolean {
        return this.#map.has(name);
    }

    public get(name: string, defaultValue?: string): string {
        return this.#map.get(name) || defaultValue || "";
    }

    public append(input: Record<string, string> | [string, string][]): this {
        const entries = isArray(input) ? input : Object.entries(input);
        for (const [key, value] of entries) {
            this.set(key, value);
        }

        return this;
    }

    public toJSON(): {[p: string]: string} {
        const object: {[p: string]: string} = {};
        for (const [key, value] of this.#map.entries()) {
            object[key] = value;
        }

        return object;
    }

    public set(name: string, value: string): void {
        this.#map.set(name, value);
    }
}
