import {AssertionError} from "./Exception/index.js";
import {isFunction, isInstanceOf, isString} from "./is.js";

export type AssertionDetailsAllowType = string | Record<any, any> | null | number;
export type AssertionDetails = (() => AssertionDetailsAllowType) | AssertionDetailsAllowType;
export type AssertionMessage = string | (() => string) | (() => Error);

function createAssertionError(message?: AssertionMessage, details?: AssertionDetails): Error | AssertionError {
    const description = isFunction(message) ? message() : message;

    return isInstanceOf(description, Error)
        ? description
        : new AssertionError(description, details);
}

export function assert(expr: unknown, message?: AssertionMessage, details?: AssertionDetails): asserts expr {
    if (!expr) {
        throw createAssertionError(message, details);
    }
}

export function validateTrue(result: true | string, details?: AssertionDetails): void {
    if (isString(result)) {
        throw createAssertionError(result, details);
    }
}

export function fails(expr: unknown, message?: AssertionMessage, details?: AssertionDetails): void {
    if (expr) {
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

export function toError(error: unknown, alt: Error | string = "Unexpected error"): Error {
    if (error instanceof Error) {
        return error;
    }

    if (typeof alt === "string") {
        return new Error(alt);
    }

    return alt;
}
