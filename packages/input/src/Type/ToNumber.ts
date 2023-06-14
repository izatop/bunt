import {isNumber, isString} from "@bunt/is";
import {Promisify} from "@bunt/type";
import {Int} from "./Int.js";
import {ScalarType} from "./ScalarType.js";

export const ToNumber = new ScalarType<number>({
    name: "Int",
    validate(payload): Promisify<number> {
        this.assert(isNumber(payload) || isString(payload), "Wrong payload type", payload);

        return Int.validate(+payload);
    },
});
