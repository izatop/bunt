import {isFunction, isNull, isUndefined} from "@bunt/is";
import {Promisify} from "@bunt/type";
import {SuperType} from "../SuperType.js";
import {TypeAbstract} from "../TypeAbstract.js";

export class NonNull<TValue> extends SuperType<TValue, TValue> {
    readonly #defaultValue: TValue | (() => TValue);

    constructor(type: TypeAbstract<TValue>, defaultValue: TValue | (() => TValue)) {
        super(type);
        this.#defaultValue = defaultValue;
    }

    public validate(payload: unknown): Promisify<TValue> {
        if (isNull(payload) || isUndefined(payload)) {
            if (isFunction(this.#defaultValue)) {
                return this.#defaultValue();
            }

            return this.#defaultValue;
        }

        return this.type.validate(payload);
    }
}
