import {isNumber, isString, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType";

export class ToNumber extends SuperType<number, number> {
    public validate(payload: unknown): Promisify<number> {
        this.assert(isNumber(payload) || isString(payload), `Wrong payload type`, payload);

        return this.type.validate(+payload);
    }
}
