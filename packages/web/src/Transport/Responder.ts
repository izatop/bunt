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
import {IncomingMessage, ServerResponse} from "http";
import {IRequestSendOptions, IResponderOptions} from "./interfaces";
import {RequestMessage} from "./RequestMessage";
import {ResponseAbstract} from "./Response";
import {IErrorResponseHeaders, TransformError} from "./TransformError";

export class Responder extends RequestMessage {
    readonly #options: IResponderOptions;
    readonly #response: ServerResponse;

    #complete = false;
    #errorHeadersMap: Map<Ctor<Error>, IErrorResponseHeaders>;

    constructor(incomingMessage: IncomingMessage,
                serverResponse: ServerResponse,
                errorHeadersMap: Map<Ctor<Error>, IErrorResponseHeaders>,
                options?: IResponderOptions) {
        super(incomingMessage, options);
        this.#options = options ?? {};
        this.#response = serverResponse;
        this.#errorHeadersMap = errorHeadersMap;
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
        assert(!this.complete, `Response was already sent`);
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

            if (isReadableStream(response)) {
                response.pipe(this.#response);
                return;
            }

            if (isError(response)) {
                const transform = new TransformError(response, this.#errorHeadersMap);
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
            const {code, status, headers = {}} = options;
            const headersMap = StrictKeyValueMap.fromObject(headers);
            if (!headersMap.has("content-type")) {
                headersMap.set("content-type", "text/plain; charset=utf-8");
            }

            for (const [header, value] of headersMap.entries()) {
                this.#response.setHeader(header, value);
            }

            this.applyServerOptions();

            this.#response.writeHead(code, status);
            this.#response.write(body);
        } finally {
            this.#complete = true;
            this.#response.end();
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
