import {isNumber, isString} from "@bunt/is";
import {Promisify} from "@bunt/type";
import {SuperType} from "../SuperType.js";

export class StringAsNumber extends SuperType<string | number, number> {
    public validate(payload: unknown): Promisify<number> {
        this.assert(isString(payload) || isNumber(payload), "Wrong payload type", payload);

        return this.type.validate(+payload);
    }
}
