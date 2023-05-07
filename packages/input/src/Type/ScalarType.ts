import {Promisify} from "@bunt/util";
import {TypeAbstract} from "../TypeAbstract.js";

export interface IScalarType<TValue> {
    name: string;
    validate: (this: ScalarType<TValue>, payload: unknown) => Promisify<TValue>;
}

export class ScalarType<TValue> extends TypeAbstract<TValue> {
    readonly #type: IScalarType<TValue>;

    public constructor(type: IScalarType<TValue>) {
        super();
        this.#type = type;
    }

    public get name(): string {
        return this.#type.name;
    }

    public validate(payload: unknown): Promisify<TValue> {
        return this.#type.validate.call(this, payload);
    }
}
