import {IncomingMessage} from "http";
import {URL} from "url";
import {Application, IHeaders, RequestAbstract, RequestValidatorAbstract} from "@bunt/app";
import {StateType} from "@bunt/unit";
import {isString, toArray} from "@bunt/util";
import {Cookies} from "./Cookies";
import {Headers} from "./Headers";
import {IRequestMessageOptions} from "./interfaces";
import {RequestProxy} from "./RequestProxy";

export class RequestMessage extends RequestAbstract {
    public readonly cookies: Cookies;
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
        this.cookies = new Cookies(this.headers);

        if (this.#options.validators) {
            this.#validators = toArray(this.#options.validators);
        }
    }

    public get host(): string {
        return this.headers.get("host", "");
    }

    public get userAgent(): string {
        return this.headers.get("user-agent", "");
    }

    public get remoteAddress(): string {
        return this.headers.get("x-real-ip", this.#message.socket.remoteAddress);
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

    public linkState(state: StateType): void {
        RequestProxy.linkState(state, new RequestProxy(this));
    }

    protected getRoute(): string {
        const {pathname} = new URL(this.#message.url || "/", "http://localhost");
        const {method = "GET"} = this.#message;

        return `${method.toUpperCase()} ${pathname}`;
    }
}
