import {IncomingMessage, ServerResponse} from "http";
import {Readable} from "stream";
import {ActionResponse, StrictKeyValueMap} from "@bunt/app";
import {
    assert,
    Ctor,
    isBoolean,
    isError,
    isFunction,
    isNumber,
    isObject,
    isReadableStream,
    isString,
    isUndefined,
} from "@bunt/util";
import {IRequestSendOptions, IResponderOptions} from "./interfaces.js";
import {RequestMessage} from "./RequestMessage.js";
import {ResponseAbstract} from "./Response/index.js";
import {IErrorResponseHeaders, TransformError} from "./TransformError.js";

export class Responder extends RequestMessage {
    readonly #options: IResponderOptions;
    readonly #response: ServerResponse;
    readonly #errorCodeMap: Map<Ctor<Error>, IErrorResponseHeaders>;

    #complete = false;

    constructor(incomingMessage: IncomingMessage,
        serverResponse: ServerResponse,
        errorCodeMap: Map<Ctor<Error>, IErrorResponseHeaders>,
        options?: IResponderOptions) {
        super(incomingMessage, options);
        this.#options = options ?? {};
        this.#response = serverResponse;
        this.#errorCodeMap = errorCodeMap;
    }

    public get complete(): boolean {
        return this.#complete;
    }

    public setResponseHeaders(headers: [string, string][]): void {
        for (const [header, value] of headers) {
            this.#response.setHeader(header, value);
        }
    }

    /**
     * @param response
     */
    public async respond(response: ActionResponse): Promise<void> {
        assert(!this.complete, "Response was already sent");
        if (isUndefined(response)) {
            return this.send("");
        }

        const accept = this.headers.get("accept");

        if (isString(response) || isNumber(response) || isBoolean(response)) {
            if (accept.includes("application/json")) {
                return this.send(JSON.stringify(response));
            }

            return this.send(response.toString());
        }

        if (isObject(response)) {
            if (Buffer.isBuffer(response)) {
                return this.send(response);
            }

            if (isError(response)) {
                const transform = new TransformError(response, this.#errorCodeMap);
                const accept = this.headers.get("accept");
                const {body: transformed, ...props} = accept.includes("application/json")
                    ? transform.toJSON()
                    : transform.toString();

                if (accept.includes("application/json")) {
                    return this.send(
                        transformed,
                        {
                            ...props,
                            headers: {
                                "content-type": "application/json; charset=utf-8",
                            },
                        },
                    );
                }

                return this.send(transformed, {...props});
            }

            if (response instanceof ResponseAbstract) {
                const {code, status, body, headers, cookies} = await response.getResponse();

                return this.send(body, {code, status, headers, cookies});
            }

            return this.send(JSON.stringify(response));
        }
    }

    /**
     * @param body
     * @param options
     */
    protected async send(body: string | undefined | Buffer | Readable,
        options: IRequestSendOptions = {code: 200}): Promise<void> {
        try {
            const {code, status, headers = {}, cookies = []} = options;
            const headersMap = StrictKeyValueMap.fromObject(headers);
            if (!headersMap.has("content-type")) {
                headersMap.set("content-type", "text/plain; charset=utf-8");
            }

            for (const [header, value] of headersMap.entries()) {
                this.#response.setHeader(header, value);
            }

            for (const cookie of cookies) {
                this.#response.setHeader("set-cookie", cookie.serialize());
            }

            this.applyServerOptions();

            this.#response.writeHead(code, status);
            if (isReadableStream(body)) {
                body.pipe(this.#response);
                await new Promise((resolve, reject) => {
                    this.#response.on("finish", resolve);
                    this.#response.on("error", reject);
                });

                return;
            }

            this.#response.end(body);
        } finally {
            this.#complete = true;
        }
    }

    protected applyServerOptions(): void {
        const headers = StrictKeyValueMap.fromObject(this.getServerHeaders());
        for (const [header, value] of headers.entries()) {
            this.#response.setHeader(header, value);
        }
    }

    protected getServerHeaders(): Record<string, string> {
        const {headers = {}} = this.#options;
        if (isFunction(headers)) {
            return headers(this);
        }

        return headers;
    }
}
