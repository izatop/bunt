import {Readable} from "stream";
import {isFunction, isInstanceOf, isNumber, isString, Promisify} from "@bunt/util";
import * as HTTP from "http-status";
import {StrictKeyValueMap} from "@bunt/app";
import {Headers} from "../Headers.js";
import {Cookie, CookieOptions} from "./Cookie.js";

export interface IResponseOptions {
    code?: number;
    status?: string;
    headers?: Promisify<Record<string, string>> | Headers;
}

export type ResponseArgs<T> = [
    reponse: Promisify<T> | (() => Promisify<T>),
    options?: IResponseOptions
];

export interface IResponseAnswer {
    code: number;
    status?: string;
    body: string | Buffer | Readable;
    headers: Record<string, string>;
    cookies: Cookie[];
}

export abstract class ResponseAbstract<T> {
    public readonly code: number = 200;
    public readonly status?: string;
    public readonly type: string = "text/plain";
    public readonly encoding: string = "utf-8";

    readonly #cookies = new Map<string, Cookie>();
    readonly #headers: Promisify<{[key: string]: string}>;
    #response: Promisify<T>;

    constructor(...[response, options = {}]: ResponseArgs<T>) {
        this.#response = isFunction(response) ? response() : response;

        const {code, status, headers} = options;
        if (isNumber(code) && code > 0) {
            this.code = code;
        }

        this.status = status;
        if (!this.status) {
            const suggest = Reflect.get(HTTP, this.code.toString());
            this.status = isString(suggest) ? suggest : "Unknown";
        }

        if (isInstanceOf(headers, Headers)) {
            this.#headers = headers.toJSON();
        } else {
            this.#headers = headers || {};
        }
    }

    public get cookies(): Cookie[] {
        return [...this.#cookies.values()];
    }

    public setContent(data: Promisify<T>): void {
        this.#response = data;
    }

    public setCookie(name: string, value: string, options: CookieOptions): void {
        this.#cookies.set(name, new Cookie(name, value, options));
    }

    public hasCookie(name: string): boolean {
        return this.#cookies.has(name);
    }

    public async getResponse(): Promise<IResponseAnswer> {
        const {status, code, cookies} = this;
        const headersMap = new StrictKeyValueMap([["content-type", this.getContentType()]]);
        headersMap.append(await this.#headers);

        return {
            code,
            status,
            cookies,
            headers: headersMap.toJSON(),
            body: this.serialize(await this.#response),
        };
    }

    public getContentType(): string {
        return `${this.type}; charset=${this.encoding}`;
    }

    protected abstract serialize(data: T): string | Buffer | Readable;
}
