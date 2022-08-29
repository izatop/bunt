import {ILogable, ILogger, LogableType, logger, Logger} from "../../../../src";

export class LoggableObjectTest<T extends LogableType> implements ILogger, ILogable<T> {
    @logger
    declare public readonly logger: Logger;

    protected value: T;

    constructor(value: T) {
        this.value = value;
    }

    public getLogValue = (): T => this.value;

    public getLogLabel = (): string => "LoggableObjectTest:#1";
}
