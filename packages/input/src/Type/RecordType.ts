import {isObject} from "@bunt/util";
import {ScalarType} from "./ScalarType";

export const RecordType = new ScalarType<Record<string, any>>({
    name: "RecordType",
    validate(payload) {
        this.assert(isObject(payload), "Wrong payload", payload);

        return payload;
    },
});
