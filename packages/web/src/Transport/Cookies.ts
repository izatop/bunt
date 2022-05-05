import {IHeaders, StrictKeyValueMap} from "@bunt/app";

export class Cookies extends StrictKeyValueMap {
    constructor(headers: IHeaders) {
        super(Cookies.parse(headers.get("cookie")));
    }

    public static parse(cookie = ""): [string, string][] {
        const entries: [string, string][] = cookie
            .split(";")
            .map((s) => s.trim())
            .map((s) => s.split("="))
            .filter((a) => a.length === 2)
            .map(([k, v]) => [k, this.decode(v)]);

        return entries;
    }

    private static decode = (value: string): string => decodeURIComponent(value);
}
