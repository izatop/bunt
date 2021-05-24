import {isObject, Promisify} from "@bunt/util";
import {IDisposable, IRunnable} from "./interfaces";
import {Runtime} from "./Runtime";

export const Signals: NodeJS.Signals[] = ["SIGINT", "SIGQUIT", "SIGTERM"];

export function isDisposable(candidate: unknown): candidate is IDisposable {
    return isObject(candidate) && "dispose" in candidate;
}

export function isRunnable(candidate: unknown): candidate is IRunnable {
    return isObject(candidate) && "getHeartbeat" in candidate;
}

export function main(...chain: ((runtime: Runtime) => Promisify<unknown>)[]): void {
    process.nextTick(async () => {
        await Runtime.run(...chain);
    });
}
