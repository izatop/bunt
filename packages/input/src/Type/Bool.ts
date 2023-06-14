import {isBoolean} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const Bool = new ScalarType<boolean>({
    name: "Bool",
    validate(payload): boolean {
        this.assert(isBoolean(payload), `Wrong payload: ${this.name} expected`, payload);

        return payload;
    },
});
