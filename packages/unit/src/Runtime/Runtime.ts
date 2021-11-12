import {isNull, isUndefined, Logger, logger, Promisify, SingleRef} from "@bunt/util";
import {Disposer, dispose} from "../Dispose";
import {Heartbeat} from "./Heartbeat";
import {DisposableFn} from "./interfaces";
import {isDisposable, isRunnable, Signals} from "./internal";

const ref = new SingleRef<Runtime>();
const DEBUG = !!process.env.DEBUG;
const ENV = process.env.NODE_ENV || "production";

export class Runtime extends Disposer {
    @logger
    public readonly logger!: Logger;

    protected readonly queue: Heartbeat[] = [];
    private readonly created: Date;

    private constructor() {
        super();

        this.created = new Date();
        this.logger.info("register", {ENV, DEBUG});

        // @TODO Send an event when a signal has been received.
        for (const signal of Signals) {
            this.logger.debug("listen", signal);
            process.on(signal, async () => this.dispose());
        }
    }

    public static on(event: "release", callback: DisposableFn): void {
        const runtime = ref.ensure();
        runtime.onDispose(callback);
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

    public static run(...chain: (() => Promisify<unknown>)[]): Promise<void> {
        const queue = this.createQueue(chain);
        const runtime = ref.create(() => new Runtime());

        return runtime.watch(queue);
    }

    public static createQueue(chain: (() => Promisify<unknown>)[]): Promise<unknown>[] {
        const queue = [];
        for (const callback of chain) {
            queue.push(new Promise<unknown>((resolve) => resolve(callback())));
        }

        return queue;
    }

    private async watch(chain: Promise<unknown>[]): Promise<void> {
        const finish = this.logger.perf("run");
        try {
            for (const pending of chain) {
                await this.handle(pending);
            }

            await Promise.allSettled(this.queue.map((heartbeat) => heartbeat.watch()));
        } catch (error) {
            this.logger.emergency("Unexpected error", error);
        } finally {
            finish();
        }

        await dispose(this);
    }

    private async handle(result: unknown): Promise<void> {
        try {
            const object = await result;
            if (isUndefined(object) || isNull(object)) {
                return;
            }

            if (isRunnable(object)) {
                this.queue.push(object.getHeartbeat());
            }

            if (isDisposable(object)) {
                this.onDispose(object);
            }
        } catch (error) {
            this.logger.error("reject", error);
        }
    }
}
