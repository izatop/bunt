import {isNumber} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const Float = new ScalarType<number>({
    name: "Float",
    validate(payload): number {
        this.assert(isNumber(payload), `Wrong payload: ${this.name} expected`, payload);
        this.assert(
            payload <= Number.MAX_SAFE_INTEGER && payload >= Number.MIN_SAFE_INTEGER,
            "Wrong payload range", payload,
        );

        return payload;
    },
});
