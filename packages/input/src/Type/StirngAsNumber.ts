import {isNumber, isString, MayNullable, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType";

export class StringAsNumber<TValue> extends SuperType<MayNullable<TValue>, Exclude<TValue, undefined | null>> {
    public validate(payload: unknown): Promisify<TValue | undefined> {
        this.assert(isString(payload) || isNumber(payload), "Wrong payload type", payload);

        return this.type.validate(+payload);
    }
}
