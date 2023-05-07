import {IResponseOptions, ResponseAbstract} from "./ResponseAbstract.js";

export class NoContentResponse extends ResponseAbstract<undefined> {
    constructor(options: IResponseOptions & {code?: never} = {}) {
        super(undefined, {status: "No Content", ...options, code: 204});
    }

    public stringify(): string {
        return "";
    }
}
