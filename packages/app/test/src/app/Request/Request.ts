import {Readable} from "stream";
import {IHeaders, KeyValueMap, RequestAbstract} from "../../../../src";
import {Headers} from "./Headers";

export class Request extends RequestAbstract {
    public readonly params = new KeyValueMap([]);
    public readonly headers: IHeaders;
    public readonly route: string;
    public readonly body: string;

    constructor(route: string, headers: {[key: string]: string}, body = "") {
        super();
        this.route = route;
        this.headers = new Headers(Object.entries(headers));
        this.body = body;
    }

    public createReadableStream(): Readable {
        return Readable.from(this.body);
    }

    public validate(): boolean {
        return true;
    }
}
