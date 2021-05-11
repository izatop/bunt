import {ScalarType} from "./ScalarType";

export const JSONString = new ScalarType<any, any>({
    name: "JSON",
    validate(payload) {
        return JSON.parse(payload);
    },
});
