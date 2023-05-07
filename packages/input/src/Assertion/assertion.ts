import {TypeAbstract} from "../TypeAbstract.js";
import {AssertionTypeError} from "./AssertionTypeError.js";

export function assert(expr: unknown, type: TypeAbstract<any>, message: string, payload: unknown): asserts expr {
    if (!expr) {
        throw new AssertionTypeError(message, type, payload);
    }
}
