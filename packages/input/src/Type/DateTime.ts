import {isNumber, isString} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const DateTime = new ScalarType<Date>({
    name: "DateTime",
    validate(payload): Date {
        this.assert(isNumber(payload) || isString(payload), `Wrong payload: ${this.name} expected`, payload);
        this.assert(validateDateValue(payload), "Wrong date format", payload);

        return new Date(payload);
    },
});

function validateDateValue(payload: string | number): boolean {
    try {
        new Date(payload).toISOString();
    } catch {
        return false;
    }

    return true;
}
