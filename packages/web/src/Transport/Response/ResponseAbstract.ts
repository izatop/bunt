import {isFunction, isInstanceOf, isNumber, Promisify} from "@bunt/util";
import * as HTTP from "http-status";
import {Headers} from "../Headers";
import {Cookie, CookieOptions} from "./Cookie";

export interface IResponseOptions {
    code?: number;
    status?: string;
    headers?: {[key: string]: string} | Headers;
}

export interface IResponseAnswer {
    code: number;
    status?: string;
    body: string | Buffer;
    headers: {[key: string]: string};
    cookies: Cookie[];
}

export abstract class ResponseAbstract<T> {
    public readonly code: number = 200;
    public readonly status?: string;
    public readonly type: string = "text/plain";
    public readonly encoding: string = "utf-8";

    readonly #cookies = new Map<string, Cookie>();
    readonly #headers: {[key: string]: string};
    #data: Promisify<T>;

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

    public get cookies(): Cookie[] {
        return [...this.#cookies.values()];
    }

    public setContent(data: Promisify<T>): void {
        this.#data = data;
    }

    public setCookie(name: string, value: string, options: CookieOptions): void {
        this.#cookies.set(name, new Cookie(name, value, options));
    }

    public hasCookie(name: string): boolean {
        return this.#cookies.has(name);
    }

    public getHeaders(): Record<any, string> {
        return {
            ...this.#headers,
            "content-type": this.getContentType(),
        };
    }

    public async getResponse(): Promise<IResponseAnswer> {
        const {status, code, cookies} = this;
        const headers = this.getHeaders();

        return {
            code,
            status,
            headers,
            cookies,
            body: this.stringify(await this.#data),
        };
    }

    public getContentType(): string {
        return `${this.type}; charset=${this.encoding}`;
    }

    protected abstract stringify(data: T): string | Buffer;
}
