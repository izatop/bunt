import {IReadableError} from "./interfaces.js";

export const isReadableError = (error: Error): error is IReadableError & Error => {
    return "toSafeJSON" in error && "toSafeString" in error;
};
