import * as os from "os";
import {AssertionError, Logger, LogMessage, SeverityLevel} from "../../../src";
import {LoggableObjectTest} from "./src/LoggableObjectTest";
import {LoggerTestTransport} from "./src/LoggerTestTransport";

describe("Logger", () => {
    const logs: LogMessage[] = [];
    Logger.add(new LoggerTestTransport(logs));

    beforeEach(() => {
        Logger.setSeverity(SeverityLevel.INFO);
        logs.splice(0, logs.length);
    });

    test("should write log", async () => {
        const loggable = new LoggableObjectTest(null);
        loggable.logger.info("alert", {attribute: 1});
        expect(logs.length).toBe(1);

        const [item] = logs;
        expect(item).toEqual({
            pid: process.pid,
            host: os.hostname(),
            label: loggable.getLogLabel(),
            message: "alert",
            severity: SeverityLevel.INFO,
            timestamp: item.timestamp,
            args: [{attribute: 1}],
        });
    });

    test("should not write log", () => {
        Logger.setSeverity(SeverityLevel.WARNING);
        const value = {random: Math.random()};
        const loggable = new LoggableObjectTest(value);
        loggable.logger.info("info");
        loggable.logger.debug("debug");
        loggable.logger.notice("notice");
        loggable.logger.warning("warning", loggable);
        expect(logs.length).toBe(1);
        expect(logs.pop()?.args).toEqual([value]);
    });

    test("should log logable error", () => {
        const extra = {test: "value"};
        const logger = new Logger("Test");
        const error = new AssertionError("Error", extra);
        error.stack = "Error stack";
        logger.error("Error", error);

        const {message, stack, constructor: {name}} = error;
        const {args = []} = logs.pop() ?? {args: []};
        expect(args.pop()).toEqual({error: {name, message, stack, extra}});
    });
});
