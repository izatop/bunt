import {isObject, Promisify} from "@bunt/util";
import {IDisposable, IRunnable} from "./interfaces";
import {Runtime} from "./Runtime";

export const Signals: NodeJS.Signals[] = ["SIGINT", "SIGQUIT", "SIGTERM"];

export function isDisposable(target: unknown): target is IDisposable {
    return isObject(target) && "dispose" in target;
}

export function isRunnable(target: unknown): target is IRunnable {
    return isObject(target) && "getHeartbeat" in target;
}

export function main(...chain: (() => Promisify<unknown>)[]): void {
    process.nextTick(async () => {
        await Runtime.run(...chain);
    });
}
