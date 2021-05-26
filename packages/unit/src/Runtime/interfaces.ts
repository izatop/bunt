import {Promisify} from "@bunt/util";
import {Heartbeat} from "./Heartbeat";

export interface IRunnable {
    getHeartbeat(): Heartbeat;
}

export interface IDisposable {
    dispose(): Promise<void>;
}

export interface IDisposedHistory {
    error?: Error;
    label: string;
    timeout: number;
    target: string;
    date: Date;
}

export type HeartbeatDisposer = (resolve: (error?: Error) => any) => Promisify<any>;

export type DisposableFn = () => Promisify<void>;
export type DisposableType = DisposableFn | IDisposable;
