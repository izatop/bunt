import {TypeAbstract} from "../TypeAbstract";
import {AssertionTypeError, IReadableTypeError} from "./AssertionTypeError";

export interface IReadableObjectError extends IReadableTypeError {
    fields: Record<string, IReadableTypeError>
}

export class AssertionObjectError extends AssertionTypeError {
    readonly #fields: Record<string, any>;

    constructor(message: string,
                type: TypeAbstract<any>,
                payload: unknown,
                fields: Record<string, IReadableTypeError>) {
        super(message, type, payload);
        this.#fields = fields;
    }

    public toSafeString(): string {
        return this.message;
    }

    public toSafeJSON(): IReadableObjectError {
        return {
            fields: this.#fields,
            ...super.toSafeJSON(),
        };
    }

    public getLogValue(): IReadableObjectError {
        return this.toSafeJSON();
    }
}
