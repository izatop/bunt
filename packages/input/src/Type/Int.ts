import {isNumber} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const Int = new ScalarType<number>({
    name: "Int",
    validate(payload): number {
        this.assert(isNumber(payload), `Wrong payload: ${this.name} expected`, payload);
        this.assert(Number.isSafeInteger(payload), "Wrong payload value", payload);

        return payload;
    },
});
