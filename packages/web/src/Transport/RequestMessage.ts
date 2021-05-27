import {Application, IHeaders, RequestAbstract, RequestValidatorAbstract} from "@bunt/app";
import {isString, toArray} from "@bunt/util";
import {IncomingMessage} from "http";
import {URL} from "url";
import {Headers} from "./Headers";
import {IRequestMessageOptions} from "./interfaces";

export class RequestMessage extends RequestAbstract {
    public readonly headers: IHeaders;
    public readonly route: string;

    readonly #method: string;
    readonly #message: IncomingMessage;
    readonly #validators: RequestValidatorAbstract<any>[] = [];
    readonly #options: IRequestMessageOptions;

    constructor(incomingMessage: IncomingMessage, options?: IRequestMessageOptions) {
        super();
        this.#options = options ?? {};
        this.#message = incomingMessage;
        this.#method = incomingMessage.method?.toUpperCase() ?? "GET";

        const headers: [string, string][] = [];
        for (const [key, value] of Object.entries(this.#message.headers)) {
            if (isString(value)) {
                headers.push([key, value]);
            }
        }

        this.route = this.getRoute();
        this.headers = new Headers(headers);
        if (this.#options.validators) {
            this.#validators = toArray(this.#options.validators);
        }
    }

    public get origin(): string {
        return this.headers.get("origin", "");
    }

    public validate(app: Application<any>): boolean {
        this.#validators.forEach((validator) => validator.validate(app, this));
        return true;
    }

    public isOptionsRequest(): boolean {
        return this.#method.startsWith("OPTIONS");
    }

    public createReadableStream(): NodeJS.ReadableStream {
        return this.#message;
    }

    public getRequestMethod(): string {
        return this.#method;
    }

    protected getRoute(): string {
        const {pathname} = new URL(this.#message.url || "/", "http://localhost");
        const {method = "GET"} = this.#message;
        return `${method.toUpperCase()} ${pathname}`;
    }
}
