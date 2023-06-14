import {isString} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const Text = new ScalarType<string>({
    name: "Text",
    validate(payload): string {
        this.assert(isString(payload), `Wrong payload: ${this.name} expected`, payload);

        return payload;
    },
});
