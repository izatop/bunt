import {isNull, isUndefined, MayNullable, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType";

export class Nullable<TValue> extends SuperType<MayNullable<TValue>, Exclude<TValue, undefined | null>> {
    public readonly nullable = true;

    public validate(payload: unknown): Promisify<TValue | undefined> {
        if (isNull(payload) || isUndefined(payload)) {
            return undefined;
        }

        return this.type.validate(payload);
    }
}
