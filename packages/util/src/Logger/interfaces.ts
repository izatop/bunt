import {Func, Logable, LogableType, Promisify} from "@bunt/type";
import {Logger} from "./Logger.js";

export enum SeverityLevel {
    EMERGENCY,
    ALERT,
    CRITICAL,
    ERROR,
    WARNING,
    NOTICE,
    INFO,
    DEBUG,
}

export interface ILoggerTransport {
    readonly writable: boolean;

    write(log: LogMessage): Promisify<void>;

    close(): Promisify<void>;
}

export interface ILogger {
    readonly logger: Logger;

    getLogLabel?(): string;

    getLogGroupId?(): string | number;
}

export type LoggerOwner = Record<any, any> | ILogger | Func;
export type LogFn = (message: string, ...args: Logable[]) => void;
export type LogWrapFn = (logger: Logger, message: string, ...args: LogableType[]) => void;
export type LogFormat<T> = (log: LogMessage) => T;

export type LogSystemInfo = {
    arch: string;
    platform: string;
    freemem: number;
    loadavg: number[];
    uptime: number;
    version: string;
    cpus: number;
};

export type LogMessage = {
    pid: number;
    host: string;
    label: string;
    timestamp: number;
    severity: SeverityLevel;
    message: string;
    groupId?: string;
    args?: LogableType[];
    system?: LogSystemInfo;
};
