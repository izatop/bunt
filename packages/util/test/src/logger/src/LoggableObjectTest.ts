import {ILogable, ILogger, LogableType, Logger} from "../../../../src";

export class LoggableObjectTest<T extends LogableType> implements ILogger, ILogable<T> {
    @logger
    public logger!: Logger;

    protected value: T;

    constructor(value: T) {
        this.value = value;
    }

    public getLogValue = (): T => this.value;

    public getLogLabel = (): string => "LoggableObjectTest:#1";
}
