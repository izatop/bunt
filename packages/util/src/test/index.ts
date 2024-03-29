import {debugLogFormat, Logger, SeverityLevel, StdOutTransport} from "../Logger";

if (process.env.NODE_ENV === "test" && process.env.LOGGER_ENABLE === "Y") {
    Logger.setSeverity(SeverityLevel.DEBUG);
    Logger.set([new StdOutTransport(debugLogFormat)]);
}
