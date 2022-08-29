import {Defer, isNull, isUndefined, LogFn, Logger, SingleRef, toError} from "@bunt/util";
import {Disposer, dispose} from "../Dispose";
import {Heartbeat} from "./Heartbeat";
import {RuntimeTask} from "./interfaces";
import {isDisposable, isRunnable, Signals} from "./internal";
import {DisposableType} from ".";

const ref = new SingleRef<Runtime>();
const DEBUG = !!process.env.DEBUG;
const ENV = process.env.NODE_ENV || "production";

export class Runtime extends Disposer {
    @logger
    public readonly logger!: Logger;

    readonly #running: Heartbeat[] = [];
    readonly #pending: Promise<unknown>[] = [];
    readonly #state = new Defer<void>();

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

    public async kill(code = 0, reason?: unknown): Promise<void> {
        const fn: LogFn = code > 0 ? this.logger.error : this.logger.info;
        fn("Kill { code: %d, reason: %s }", code, reason);

        await Promise.allSettled(this.#pending);
        await dispose(this);
        await dispose(Logger);
        if (!Runtime.isTest()) {
            process.exit(code);
        }
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
        return ENV === "production";
    }

    public static isDevelopment(): boolean {
        return ENV !== "production";
    }

    public static isTest(): boolean {
        return ENV === "test";
    }

    public static run(tasks: RuntimeTask[]): Runtime {
        return ref
            .once(() => new Runtime())
            .run(tasks);
    }

    private run(tasks: RuntimeTask[]): this {
        for (const task of tasks) {
            this.#pending.push(this.handle(task));
        }

        return this;
    }

    public async watch(): Promise<void> {
        const finish = this.logger.perf("run");
        try {
            await Promise.allSettled(this.#pending);
            await Promise.all(this.#running.map((heartbeat) => heartbeat.watch()));
        } catch (error) {
            this.error(error);
        } finally {
            finish();
        }

        const code = this.#state.rejected ? 1 : 0;
        const reason = this.#state.rejected ? "Some tasks were rejected" : "As expected";
        await this.kill(code, reason);
    }

    private async handle(task: RuntimeTask): Promise<void> {
        try {
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
        } catch (error) {
            this.error(error);

            throw error;
        }
    }

    private error(error: unknown): void {
        this.logger.alert(toError(error).message, error);
        this.#state.reject(error);
    }
}
