import {TypeAbstract} from "../TypeAbstract.js";
import {AssertionTypeError, IReadableTypeError} from "./AssertionTypeError.js";

export interface IReadableListField extends IReadableTypeError {
    index: number;
}

export interface IReadableListError extends IReadableTypeError {
    fields: IReadableListField[];
}

export class AssertionListError extends AssertionTypeError {
    readonly #fields: IReadableListField[];

    constructor(message: string, type: TypeAbstract<any>, payload: unknown, fields: IReadableListField[]) {
        super(message, type, payload);
        this.#fields = fields;
    }

    public toSafeString(): string {
        return this.message;
    }

    public toSafeJSON(): IReadableListError {
        return {
            fields: this.#fields,
            ...super.toSafeJSON(),
        };
    }

    public getLogValue(): IReadableListError {
        return this.toSafeJSON();
    }
}
