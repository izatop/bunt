import {KeyValueMap} from "./KeyValueMap";

const toStrictKey = (key: string) => key.toLowerCase();

export class StrictKeyValueMap extends KeyValueMap {
    constructor(values: [string, string][]) {
        super(values.map(([key, value]) => [toStrictKey(key), value]));
    }

    public delete(name: string): void {
        super.delete(toStrictKey(name));
    }

    public get(name: string, defaultValue?: string): string {
        return super.get(toStrictKey(name)) || defaultValue || "";
    }

    public has(name: string): boolean {
        return super.has(toStrictKey(name));
    }

    public set(name: string, value: string): void {
        super.set(toStrictKey(name), value);
    }
}
