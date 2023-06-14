import {MayNullable, Promisify} from "@bunt/type";
import {isNull, isUndefined} from "@bunt/is";
import {SuperType} from "../SuperType.js";

export class Nullable<TValue> extends SuperType<MayNullable<TValue>, Exclude<TValue, undefined | null>> {
    public readonly nullable = true;

    public validate(payload: unknown): Promisify<TValue | undefined> {
        if (isNull(payload) || isUndefined(payload)) {
            return undefined;
        }

        return this.type.validate(payload);
    }
}
