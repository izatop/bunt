import {Defer, isNull, isUndefined, Logger, logger, SingleRef} from "@bunt/util";
import {Disposer, dispose} from "../Dispose";
import {Heartbeat} from "./Heartbeat";
import {RuntimeTask} from "./interfaces";
import {isDisposable, isRunnable, Signals} from "./internal";

const ref = new SingleRef<Runtime>();
const DEBUG = !!process.env.DEBUG;
const ENV = process.env.NODE_ENV || "production";

export class Runtime extends Disposer {
    @logger
    public readonly logger!: Logger;

    readonly #running: Heartbeat[] = [];
    readonly #working: Promise<unknown>[] = [];
    readonly #state = new Defer<void>();

    private readonly created: Date;

    private constructor() {
        super();

        this.created = new Date();
        this.logger.info("register", {ENV, DEBUG});

        // @TODO Send an event when a signal has been received.
        for (const signal of Signals) {
            this.logger.debug("listen", signal);
            process.on(signal, async () => Runtime.kill());
        }
    }

    public static async kill(code = 0) {
        const runtime = ref.ensure();
        await Promise.allSettled(runtime.#working);
        await dispose(runtime);

        if (!this.isTest()) {
            process.exit(code);
        }
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

    public static run(...tasks: RuntimeTask[]): Runtime {
        return ref
            .once(() => new Runtime())
            .run(tasks);
    }

    private run(tasks: RuntimeTask[]): this {
        for (const task of tasks) {
            try {
                this.#working.push(Promise.resolve(task()));
            } catch (error) {
                this.#working.push(Promise.reject(error));
            }
        }

        return this;
    }

    private async watch(): Promise<void> {
        const finish = this.logger.perf("run");
        try {
            await Promise.allSettled(this.#working.map((job) => this.handle(job)));
            await Promise.all(this.#running.map((heartbeat) => heartbeat.watch()));
        } catch (error) {
            this.error(error);
        } finally {
            finish();
        }

        await dispose(this);
    }

    private async handle(result: unknown): Promise<void> {
        try {
            const object = await result;
            this.logger.debug("handle", {object});

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

    private error(error: unknown) {
        this.logger.alert("Unexpected error", error);
        this.#state.reject(error);
    }
}
