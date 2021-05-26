import {TypeAbstract} from "../TypeAbstract";
import {AssertionTypeError} from "./AssertionTypeError";

export function assert(expr: unknown, type: TypeAbstract<any>, message: string, payload: unknown): asserts expr {
    if (!expr) {
        throw new AssertionTypeError(message, type, payload);
    }
}
