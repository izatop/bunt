import {isNull, isUndefined, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType";

export class Nullable<TValue> extends SuperType<TValue | undefined, TValue> {
    public validate(payload: unknown): Promisify<TValue | undefined> {
        if (isNull(payload) || isUndefined(payload)) {
            return undefined;
        }

        return this.type.validate(payload);
    }
}
