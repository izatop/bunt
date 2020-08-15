import {AssertionError} from "./Exception";
import {isFunction, isInstanceOf} from "./is";

export type AssertionDetailsAllowType = string | Record<any, any> | null | number;
export type AssertionDetails = (() => AssertionDetailsAllowType) | AssertionDetailsAllowType;
export type AssertionMessage = string | (() => string) | (() => Error);

function createAssertionError(message?: AssertionMessage, details?: AssertionDetails) {
    const description = isFunction(message) ? message() : message;
    return isInstanceOf(description, Error) ? description : new AssertionError(description, details);
}

export function assert(expr: unknown, message?: AssertionMessage, details?: AssertionDetails): asserts expr {
    if (!expr) {
        throw createAssertionError(message, details);
    }
}

export function fails(expr: unknown, message?: AssertionMessage, details?: AssertionDetails): void {
    if (!!expr) {
        throw createAssertionError(message, details);
    }
}

export function pass<T>(value: unknown, transform: (v: any) => T, validator: (v: any) => boolean, label?: string): T {
    assert(value, `${label || "Value"} should be defined`);

    const nextValue = transform(value);
    assert(
        validator(nextValue),
        `This ${label || "value"} "${nextValue}" should pass the validation stage: ${validator.toString()}`,
    );

    return nextValue;
}
