import {LogFormat, LogMessage, SeverityLevel} from "../interfaces.js";
import {defaultLogFormat} from "./formatters.js";
import {InOutTransportAbstract} from "./InOutTransportAbstract.js";

export class StdErrorTransport extends InOutTransportAbstract<string> {
    constructor(format?: LogFormat<string>) {
        super(format ?? defaultLogFormat);
    }

    protected get stream(): NodeJS.WritableStream {
        return process.stderr;
    }

    public close(): void {
        return;
    }

    protected test(log: LogMessage): boolean {
        return log.severity < SeverityLevel.NOTICE;
    }
}
