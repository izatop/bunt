import {isNumber} from "@bunt/util";
import {ScalarType} from "./ScalarType";

export const Float = new ScalarType<number>({
    name: "Float",
    validate(payload) {
        this.assert(isNumber(payload), `Wrong payload: ${this.name} expected`, payload);
        this.assert(
            payload <= Number.MAX_SAFE_INTEGER && payload >= Number.MIN_SAFE_INTEGER,
            "Wrong payload range", payload,
        );

        return payload;
    },
});
