import {isObject} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

export const RecordType = new ScalarType<Record<string, any>>({
    name: "RecordType",
    validate(payload): Record<string, any> {
        this.assert(isObject(payload), "Wrong payload", payload);

        return payload;
    },
});
