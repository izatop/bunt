import {assert} from "@bunt/util";
import * as HTTP from "http-status";
import {IResponseOptions, ResponseAbstract} from "./ResponseAbstract";

export class Redirect extends ResponseAbstract<undefined> {
    constructor(location: string, code = HTTP.MOVED_PERMANENTLY, options: IResponseOptions = {}) {
        assert(code >= 300 && code < 400, "Status code should be 3xx");
        const headers = {...options.headers, location};
        super(undefined, {...options, headers, code: code});
    }

    public stringify(): string {
        return "";
    }
}
