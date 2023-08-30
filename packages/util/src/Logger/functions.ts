import {isObject} from "@bunt/is";
import {ILogable, ILogger, Logable, LoggerOwner} from "./interfaces.js";
import {Logger} from "./Logger.js";

export function isLoggerOwner(target: LoggerOwner): target is ILogger {
    return "getLogLabel" in target || "getLogGroupId" in target;
}

export function isLogable(target: Logable): target is ILogable<any> {
    return isObject(target) && "getLogValue" in target;
}

export const logger: PropertyDecorator = (target, propertyKey) => {
    Object.defineProperty(
        target,
        propertyKey,
        {
            get() {
                return Logger.factory(this);
            },
        },
    );
};
