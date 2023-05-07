import {isNumber, isString, Promisify} from "@bunt/util";
import {Int} from "./Int.js";
import {ScalarType} from "./ScalarType.js";

export const ToNumber = new ScalarType<number>({
    name: "Int",
    validate(payload): Promisify<number> {
        this.assert(isNumber(payload) || isString(payload), "Wrong payload type", payload);

        return Int.validate(+payload);
    },
});
