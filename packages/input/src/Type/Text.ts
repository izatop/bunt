import {isString} from "@bunt/util";
import {ScalarType} from "./ScalarType";

export const Text = new ScalarType<string>({
    name: "Text",
    validate(payload): string {
        this.assert(isString(payload), `Wrong payload: ${this.name} expected`, payload);

        return payload;
    },
});
