import {isString, MayNullable, Promisify} from "@bunt/util";
import {MayInput} from "../interfaces";
import {TypeAbstract} from "../TypeAbstract";

export class Enum<T extends string | number> extends TypeAbstract<T> {
    readonly #value: any;

    constructor(value: { [key: string]: T }) {
        super();
        this.#value = value;
    }

    public validate(input: MayNullable<MayInput>): Promisify<T> {
        this.assert(isString(input), "Wrong type", input);
        this.assert(!/^\d+$/.test(input), "Wrong value", input);
        this.assert(input in this.#value, "Wrong value", input);

        return this.#value[input];
    }
}
