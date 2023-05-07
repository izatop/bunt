import {isNumber, isString, Promisify} from "@bunt/util";
import {SuperType} from "../SuperType.js";

export class StringAsNumber extends SuperType<string | number, number> {
    public validate(payload: unknown): Promisify<number> {
        this.assert(isString(payload) || isNumber(payload), "Wrong payload type", payload);

        return this.type.validate(+payload);
    }
}
