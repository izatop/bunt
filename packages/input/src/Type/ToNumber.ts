import {isNumber, isString} from "@bunt/util";
import {Int} from "./Int";
import {ScalarType} from "./ScalarType";

export const ToNumber = new ScalarType<number>({
    name: "Int",
    validate(payload) {
        this.assert(isNumber(payload) || isString(payload), "Wrong payload type", payload);

        return Int.validate(+payload);
    },
});
