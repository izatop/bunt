import * as os from "os";
import {fn} from "../function";
import {isDefined, isFunction, isInstanceOf, isNumber, isUndefined} from "../is";
import {Perf} from "../Perf";
import {isLogable, isLoggerOwner} from "./functions";
import {
    ILogger,
    ILoggerTransport,
    Logable,
    LogableType,
    LogFn,
    LoggerOwner,
    LogMessage,
    LogWrapFn,
    SeverityLevel,
} from "./interfaces";

type SafeLog = (log: LogMessage) => void;

const pid = process.pid;
const host = os.hostname();
const writers: SafeLog[] = [];
const transports: ILoggerTransport[] = [];
const loggers = new WeakMap<LoggerOwner, Logger>();

export class Logger {
    protected static severity = SeverityLevel.INFO;
    protected static emergency = Logger.make(SeverityLevel.EMERGENCY);
    protected static alert = Logger.make(SeverityLevel.ALERT);
    protected static critical = Logger.make(SeverityLevel.CRITICAL);
    protected static error = Logger.make(SeverityLevel.ERROR);
    protected static warning = Logger.make(SeverityLevel.WARNING);
    protected static notice = Logger.make(SeverityLevel.NOTICE);
    protected static info = Logger.make(SeverityLevel.INFO);
    protected static debug = Logger.make(SeverityLevel.DEBUG);

    #label: string;
    public groupId?: string;

    constructor(label: string, groupId?: string | number) {
        this.#label = label;
        this.groupId = isNumber(groupId)
            ? groupId.toString()
            : groupId;
    }

    public get label() {
        return this.#label;
    }

    public get severity(): SeverityLevel {
        return Logger.severity;
    }

    public setLabel(label: string): void {
        this.#label = label;
    }

    public static setSeverity(severity: SeverityLevel): void {
        this.severity = severity;
        const severities = [
            ["debug", SeverityLevel.DEBUG],
            ["info", SeverityLevel.INFO],
            ["notice", SeverityLevel.NOTICE],
            ["warning", SeverityLevel.WARNING],
            ["error", SeverityLevel.ERROR],
            ["critical", SeverityLevel.CRITICAL],
            ["alert", SeverityLevel.ALERT],
            ["emergency", SeverityLevel.EMERGENCY],
        ];

        for (const [severityFn, makeSeverity] of severities) {
            Reflect.set(this, severityFn, this.make(makeSeverity as SeverityLevel));
        }
    }

    public static add(transport: ILoggerTransport, unref = true): void {
        transports.push(transport);
        const safeFn = fn.safe(async (log: LogMessage) => {
            if (transport.writable) {
                await transport.write(log);
            }
        });

        writers.push(unref ? fn.isolate(safeFn) : safeFn);
    }

    public static set(list: ILoggerTransport[]): void {
        this.reset();
        for (const item of list) {
            this.add(item);
        }
    }

    public static reset(): void {
        writers.splice(0, transports.length);
        transports.splice(0, transports.length);
    }

    public static factory(target: LoggerOwner): Logger {
        return loggers.get(target) || this.createLogger(target);
    }

    protected static createLogger(target: LoggerOwner): Logger {
        const label = isFunction(target) ? target.name : target.constructor.name;
        if (isLoggerOwner(target)) {
            const logger = new this(target.getLogLabel?.() ?? label, target.getLogGroupId?.());
            loggers.set(target, logger);
            return logger;
        }

        const logger = new this(label);
        loggers.set(target, logger);
        return logger;
    }

    protected static write(logger: Logger, severity: SeverityLevel, message: string, ...args: LogableType[]): void {
        const {label} = logger;
        const timestamp = Date.now();
        const log: LogMessage = {pid, host, label, severity, message, timestamp};

        if (severity < SeverityLevel.WARNING) {
            log.system = {
                freemem: os.freemem(),
                loadavg: os.loadavg(),
                arch: os.arch(),
                platform: os.platform(),
                cpus: os.cpus().length,
                version: process.version,
                uptime: os.uptime(),
            };
        }

        if (logger.groupId) {
            log.groupId = logger.groupId;
        }

        if (args.length > 0) {
            log.args = [];
            for (const arg of args) {
                if (isInstanceOf(arg, Error)) {
                    log.args.push(arg.stack);
                    if (isLogable(arg)) {
                        const logValue = arg.getLogValue();
                        if (isDefined(logValue)) {
                            log.args.push(arg.getLogValue());
                        }
                    }

                    continue;
                }

                if (isLogable(arg)) {
                    log.args.push(arg.getLogValue());
                    continue;
                }

                log.args.push(arg);
            }
        }

        writers.forEach((write) => write(log));
    }

    protected static make(severity: SeverityLevel): LogWrapFn {
        if (severity > this.severity) {
            return (): void => void 0;
        }

        return (logger: Logger, message: string, ...args: LogableType[]): void => {
            this.write(logger, severity, message, ...args);
        };
    }

    public async dispose(): Promise<void> {
        writers.splice(0, writers.length);
        await Promise.allSettled(transports.map((transport) => transport.close()));
    }

    public add(child: ILogger): void {
        if (child.logger === this || isDefined(child.logger.groupId) || isUndefined(this.groupId)) {
            return;
        }

        child.logger.groupId = this.groupId;
    }

    public perf(message: string, ...args: Logable[]): () => void {
        if (this.severity < SeverityLevel.DEBUG) {
            return (): void => void 0;
        }

        const perf = new Perf(this.label, message);
        return (): void => {
            perf.finish();
            this.debug("perf", perf, ...args);
        };
    }

    public emergency: LogFn = (...args) => Logger.emergency(this, ...args);

    public alert: LogFn = (...args) => Logger.alert(this, ...args);

    public critical: LogFn = (...args) => Logger.critical(this, ...args);

    public error: LogFn = (...args) => Logger.error(this, ...args);

    public warning: LogFn = (...args) => Logger.warning(this, ...args);

    public notice: LogFn = (...args) => Logger.notice(this, ...args);

    public info: LogFn = (...args) => Logger.info(this, ...args);

    public debug: LogFn = (...args) => Logger.debug(this, ...args);
}
