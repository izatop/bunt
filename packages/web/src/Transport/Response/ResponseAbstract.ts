import {isFunction, isInstanceOf, isNumber, Promisify} from "@bunt/util";
import * as HTTP from "http-status";
import {Headers} from "../Headers";
import {TransformError} from "../TransformError";

export interface IResponseOptions {
    code?: number;
    status?: string;
    headers?: { [key: string]: string } | Headers;
}

export interface IResponseAnswer {
    code: number;
    status?: string;
    body: string | Buffer;
    headers: { [key: string]: string };
}

export abstract class ResponseAbstract<T> {
    public readonly code: number = 200;
    public readonly status?: string;
    public readonly type: string = "text/plain";
    public readonly encoding: string = "utf-8";
    readonly #data: Promisify<T>;
    readonly #headers: { [key: string]: string };

    constructor(data: Promisify<T> | (() => Promisify<T>), options: IResponseOptions = {}) {
        this.#data = isFunction(data) ? data() : data;

        const {code, status, headers} = options;
        if (isNumber(code) && code > 0) {
            this.code = code;
        }

        this.status = status;
        if (!this.status && this.code in HTTP) {
            this.status = Reflect.get(HTTP, this.code);
        }

        if (isInstanceOf(headers, Headers)) {
            this.#headers = headers.toJSON();
        } else {
            this.#headers = headers || {};
        }
    }

    public getHeaders(): Record<any, string> {
        return {
            ...this.#headers,
            "content-type": this.getContentType(),
        };
    }

    public async getResponse(): Promise<IResponseAnswer> {
        const {status, code} = this;
        const headers = this.getHeaders();
        try {
            return {
                code,
                status,
                headers,
                body: this.stringify(await this.#data),
            };
        } catch (error) {
            const transform = new TransformError(error);
            return {
                ...transform.toJSON(),
                headers,
            };
        }
    }

    public getContentType(): string {
        return `${this.type}; charset=${this.encoding}`;
    }

    protected abstract stringify(data: T): string | Buffer;
}
