import {Promisify} from "@bunt/util";
import {Heartbeat} from "./Heartbeat.js";

export interface IRunnable {
    getHeartbeat(): Heartbeat;
}

export interface IDisposable {
    dispose(): Promise<void>;
}

export interface IDisposedHistory {
    error?: Error | unknown;
    label: string;
    timeout: number;
    target: string;
    date: Date;
}

export type HeartbeatTarget = Record<any, any> | ((...args: unknown[]) => unknown);
export type HeartbeatRunningQueue = PromiseLike<unknown>;

export type DisposableFn = () => Promisify<void>;
export type DisposableType = DisposableFn | IDisposable;

export type RuntimeTask = () => Promisify<unknown>;
