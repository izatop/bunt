import {Promisify} from "../../interfaces.js";
import {ILoggerTransport, LogFormat, LogMessage} from "../interfaces.js";

export interface ILoggerStreamCallback<T> {
    writable: boolean;

    write(log: T, encoding?: string): void;
}

export type LoggerWritableStream<T> = ILoggerStreamCallback<T>;

export abstract class InOutTransportAbstract<T> implements ILoggerTransport {
    protected abstract readonly stream: LoggerWritableStream<T>;

    readonly #format: LogFormat<T>;

    constructor(formatter: LogFormat<T>) {
        this.#format = formatter;
    }

    public get writable(): boolean {
        return this.stream.writable;
    }

    public write(log: LogMessage): void {
        if (this.test(log)) {
            this.stream.write(this.#format(log));
        }
    }

    public abstract close(): Promisify<void>;

    protected abstract test(log: LogMessage): boolean;
}
