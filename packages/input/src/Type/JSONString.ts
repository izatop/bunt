import {isString} from "@bunt/util";
import {ScalarType} from "./ScalarType.js";

export const JSONString = new ScalarType<any>({
    name: "JSON",
    validate(payload): any {
        this.assert(isString(payload), "Wrong payload", payload);

        try {
            return JSON.parse(payload);
        } catch (error) {
            this.assert(false, "Wrong JSON", payload);
        }
    },
});
