import {isFunction, isNull, isUndefined, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType";
import {TypeAbstract} from "../TypeAbstract";

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
