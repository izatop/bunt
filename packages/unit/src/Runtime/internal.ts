import {isObject} from "@bunt/is";
import {Logger} from "@bunt/util";
import {IDisposable, IRunnable, RuntimeTask} from "./interfaces.js";
import {Runtime} from "./Runtime.js";

export const Signals: NodeJS.Signals[] = ["SIGINT", "SIGQUIT", "SIGTERM"];

export function isDisposable(target: unknown): target is IDisposable {
    return isObject(target) && "dispose" in target;
}

export function isRunnable(target: unknown): target is IRunnable {
    return isObject(target) && "getHeartbeat" in target;
}

export function main(...tasks: RuntimeTask[]): void {
    Runtime.run(tasks)
        .watch();
}

export const SystemLogger = new Logger("System");
