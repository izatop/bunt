import {isFunction} from "@bunt/is";
import {ILogable} from "@bunt/type";
import {ValidationError} from "./ValidationError.js";

export class AssertionError extends ValidationError implements ILogable<Record<any, any>> {
    public readonly details?: any;

    constructor(message?: string, details?: unknown | (() => unknown)) {
        super(message || "Assertion fails");

        this.details = isFunction(details)
            ? details()
            : details;
    }

    public getLogValue(): Record<any, any> {
        return this.details;
    }
}
