import {IResponder, KeyValueMap, RouteResponse} from "@bunt/app";
import {
    assert,
    isBoolean,
    isError,
    isFunction,
    isNull,
    isNumber,
    isObject,
    isReadableStream,
    isString,
    isUndefined,
} from "@bunt/util";
import {IncomingMessage, ServerResponse} from "http";
import {IRequestSendOptions, IResponderOptions} from "./interfaces";
import {RequestMessage} from "./RequestMessage";
import {ResponseAbstract} from "./Response";
import {TransformError} from "./TransformError";

export class Responder extends RequestMessage implements IResponder {
    readonly #options: IResponderOptions;
    readonly #response: ServerResponse;

    #complete = false;

    constructor(incomingMessage: IncomingMessage, serverResponse: ServerResponse, options?: IResponderOptions) {
        super(incomingMessage, options);
        this.#options = options ?? {};
        this.#response = serverResponse;
    }

    public get complete(): boolean {
        return this.#complete;
    }

    public setResponseHeaders(headers: [string, string][]): void {
        for (const [header, value] of headers) {
            this.#response.setHeader(header, value);
        }
    }

    public async respond(response: RouteResponse): Promise<void> {
        assert(!this.complete, `Response was already sent`);
        try {
            await this.write(response);
        } finally {
            this.#complete = true;
        }
    }

    /**
     * @param response
     */
    protected async write(response: RouteResponse): Promise<void> {
        // @TODO Validate types in the Accept header before send a #response.

        if (isUndefined(response) || isNull(response)) {
            return this.send("");
        }

        if (isString(response) || isNumber(response) || isBoolean(response)) {
            return this.send(response.toString());
        }

        if (isObject(response)) {
            if (Buffer.isBuffer(response)) {
                return this.send(response);
            }

            if (isReadableStream(response)) {
                response.pipe(this.#response);
                return;
            }

            if (isError(response)) {
                const transform = new TransformError(response);
                const accept = this.headers.get("accept");
                const {body: transformed, ...status} = accept.includes("application/json")
                    ? transform.toJSON()
                    : transform.toString();

                if (accept.includes("application/json")) {
                    return this.send(transformed, {...status, headers: {"content-type": "application/json"}});
                }

                return this.send(transformed, {...status});
            }

            if (response instanceof ResponseAbstract) {
                const {code, status, body, headers} = await response.getResponse();
                return this.send(body, {code, status, headers});
            }

            return this.send(JSON.stringify(response));
        }
    }

    /**
     * @param body
     * @param options
     */
    protected send(body: string | undefined | Buffer, options: IRequestSendOptions = {code: 200}): void {
        try {
            const {code, status} = options;
            const headers = new KeyValueMap(Object.entries(options.headers || {}));
            if (!headers.has("content-type")) {
                headers.set("content-type", "text/plain; charset=utf-8");
            }

            for (const [header, value] of headers.entries()) {
                this.#response.setHeader(header, value);
            }

            this.applyServerOptions();

            this.#response.writeHead(code, status);
            this.#response.write(body);
        } finally {
            this.#response.end();
        }
    }

    protected applyServerOptions(): void {
        const headers = this.getServerHeaders();
        for (const [header, value] of Object.entries(headers)) {
            this.#response.setHeader(header, value);
        }
    }

    protected getServerHeaders(): Record<any, string> {
        const headers = this.#options.headers ?? {};
        if (isFunction(headers)) {
            return headers(this);
        }

        return headers;
    }
}
