import {isNumber, isString} from "@bunt/util";
import {ScalarType} from "./ScalarType";

export const Numeric = new ScalarType<number>({
    name: "Numeric",
    validate(payload) {
        this.assert(isNumber(payload) || isString(payload), `Wrong payload: ${this.name} expected`, payload);
        const value = isNumber(payload) ? payload : parseInt(payload, 10);

        this.assert(
            !isNaN(value) && Number.isSafeInteger(value),
            `Wrong payload: ${this.name} expected`,
            payload,
        );

        return value;
    },
});
