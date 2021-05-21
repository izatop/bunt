import {Ctor, isReadableError} from "@bunt/util";
import {ServerError} from "./ServerError";

export interface IErrorResponse {
    code: number;
    status?: string;
    body: string;
}

export interface IErrorResponseHeaders {
    readonly code: number;
    readonly status?: string;
    readonly headers?: Record<string, string>;
}

export class TransformError {
    readonly #error: Error;

    readonly #errorHeadersMap: Map<Ctor<Error>, IErrorResponseHeaders>;

    constructor(error: Error, errorHeadersMap: Map<Ctor<Error>, IErrorResponseHeaders>) {
        this.#error = error;
        this.#errorHeadersMap = errorHeadersMap;
    }

    public toString(): IErrorResponse {
        return {
            body: this.getResponse(),
            ...this.getStatus(),
        };
    }

    public toJSON(): IErrorResponse {
        return {
            body: JSON.stringify(this.getResponseJSON()),
            ...this.getStatus(),
        };
    }

    private getStatus(): { code: number; status?: string } {
        if (this.#error instanceof ServerError) {
            const {code, status} = this.#error;
            return {code, status};
        }

        return {code: 500, status: "Internal Server Error"};
    }

    private getResponse(): string {
        if (isReadableError(this.#error)) {
            return this.#error.toSafeString();
        }

        return this.#error.message;
    }

    private getResponseJSON(): Record<any, any> {
        if (isReadableError(this.#error)) {
            return this.#error.toSafeJSON();
        }

        return {error: this.#error.message};
    }
}
