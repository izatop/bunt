import {logger, Logger, SingleRef} from "@bunt/util";
import {toError} from "@bunt/assert";
import {isNull, isUndefined} from "@bunt/is";
import {Disposer, dispose} from "../Dispose/index.js";
import {Heartbeat} from "./Heartbeat.js";
import {RuntimeTask} from "./interfaces.js";
import {isDisposable, isRunnable, Signals} from "./internal.js";
import {DisposableType} from ".";

const ref = new SingleRef<Runtime>();
const DEBUG = !!process.env.DEBUG;
const ENV = process.env.NODE_ENV || "production";

export class Runtime extends Disposer {
    @logger
    declare protected readonly logger: Logger;

    readonly #running: Heartbeat[] = [];
    readonly #pending: Promise<unknown>[] = [];

    private readonly created: Date;

    private constructor() {
        super();

        this.created = new Date();
        this.logger.info("run", {ENV, DEBUG, date: this.created});

        for (const signal of Signals) {
            this.logger.debug("watch", signal);
            process.on(signal, async () => Runtime.kill(0, `Signal ${signal} has been received`));
        }
    }

    public static kill(code = 0, reason?: unknown): Promise<void> {
        return ref
            .ensure()
            .kill(code, reason);
    }

    public static onDispose(disposable: DisposableType): Runtime {
        return ref
            .ensure()
            .onDispose(disposable);
    }

    public static isDebugEnable(): boolean {
        return DEBUG;
    }

    public static isProduction(): boolean {
        return this.env === "production";
    }

    public static isDevelopment(): boolean {
        return this.env !== "production";
    }

    public static isTest(): boolean {
        return this.env === "test";
    }

    public static get env(): string {
        return ENV;
    }

    public static run(tasks: RuntimeTask[]): Runtime {
        return ref
            .once(() => new Runtime())
            .run(tasks);
    }

    public async kill(code = 0, reason?: unknown): Promise<void> {
        this.logger.info("kill { code: %d, reason: %s }", code, reason);

        await Promise.allSettled(this.#pending);
        await Promise.allSettled(this.#running.map((heartbeat) => heartbeat.dispose()));
        await dispose(this);
        await dispose(Logger);

        if (!Runtime.isTest()) {
            process.exit(code);
        }
    }

    private run(tasks: RuntimeTask[]): this {
        for (const task of tasks) {
            this.#pending.push(this.handle(task));
        }

        return this;
    }

    public async watch(): Promise<void> {
        try {
            await Promise.all(this.#pending);
            await Promise.all(this.#running.map((heartbeat) => heartbeat.watch()));
            await this.kill(0, "As expected");
        } catch (error) {
            this.logger.alert(toError(error).message, error);
            await this.kill(1, "Some tasks were rejected");
        }
    }

    private async handle(task: RuntimeTask): Promise<void> {
        this.logger.debug("Run task");

        const object = await task();
        if (isUndefined(object) || isNull(object)) {
            return;
        }

        if (isRunnable(object)) {
            const heartbeat = object.getHeartbeat();
            this.onDispose(heartbeat);
            this.#running.push(heartbeat);
        }

        if (isDisposable(object)) {
            this.onDispose(object);
        }
    }
}
