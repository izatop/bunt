import {IKeyValueMap} from "../interfaces";

export class KeyValueMap implements IKeyValueMap {
    readonly #map: Map<string, string>;

    constructor(values: [string, string][]) {
        this.#map = new Map(values);
    }

    public delete(name: string): void {
        this.#map.delete(name);
    }

    public entries(): [string, string][] {
        return [...this.#map.entries()];
    }

    public get(name: string, defaultValue?: string): string {
        return this.#map.get(name.toLowerCase()) || defaultValue || "";
    }

    public has(name: string): boolean {
        return this.#map.has(name);
    }

    public set(name: string, value: string): void {
        this.#map.set(name.toLowerCase(), value);
    }

    public toJSON(): { [p: string]: string } {
        const object: { [p: string]: string } = {};
        for (const [key, value] of this.#map.entries()) {
            object[key] = value;
        }

        return object;
    }
}
