import {IReadableError, ValidationError} from "@bunt/assert";
import {ILogable} from "@bunt/type";
import {TypeAbstract} from "../TypeAbstract.js";

export interface IReadableTypeError {
    type: string;
    message: string;
    payload: unknown;
}

export class AssertionTypeError extends ValidationError implements IReadableError, ILogable<IReadableTypeError> {
    readonly #payload: unknown;
    readonly #type: TypeAbstract<any>;

    constructor(message: string, type: TypeAbstract<any>, payload: unknown) {
        super(message);
        this.#payload = payload;
        this.#type = type;
    }

    public toSafeString(): string {
        return this.message;
    }

    public toSafeJSON(): IReadableTypeError {
        return {
            message: this.toSafeString(),
            payload: this.#payload,
            type: this.#type.name,
        };
    }

    public getLogValue(): IReadableTypeError {
        return this.toSafeJSON();
    }
}
