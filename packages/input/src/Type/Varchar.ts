import {isString, isUndefined, Promisify} from "@bunt/util";
import {TypeAbstract} from "../TypeAbstract";

interface IVarchar {
    readonly min?: number;
    readonly max?: number;
}

export class Varchar extends TypeAbstract<string> {
    readonly #options: IVarchar;

    constructor(options: IVarchar = {}) {
        super();
        this.#options = options;
        const {min, max} = options;
        this.assert(isUndefined(min) || min > -1, `Wrong ${this.name} min size`, min);
        this.assert(isUndefined(max) || max < Number.MAX_SAFE_INTEGER, `Wrong ${this.name} max size`, max);
    }

    public validate(payload: unknown): Promisify<string> {
        const {min, max} = this.#options;
        this.assert(isString(payload), `Wrong payload: ${this.name} expected`, payload);
        this.assert(
            !min || payload.length >= min,
            `Wrong payload: ${this.name} min ${min}`,
            payload,
        );

        this.assert(
            !max || payload.length <= max,
            `Wrong payload: ${this.name} min ${min}`,
            payload,
        );

        return payload;
    }
}
