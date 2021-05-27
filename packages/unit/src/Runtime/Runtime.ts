import {isNull, isUndefined, Logger, logger, Promisify, SingleRef} from "@bunt/util";
import {Disposable, dispose} from "../Dispose";
import {Heartbeat} from "./Heartbeat";
import {DisposableFn, IDisposable} from "./interfaces";
import {isDisposable, isRunnable, Signals} from "./internal";

const ref = new SingleRef<Runtime>();
const DEBUG = !!process.env.DEBUG;
const ENV = process.env.NODE_ENV || "production";

export class Runtime implements IDisposable {
    @logger
    public readonly logger!: Logger;

    protected readonly queue: Heartbeat[] = [];
    private readonly created: Date;

    private constructor() {
        this.created = new Date();
        this.logger.info("register", {ENV, DEBUG});

        // @TODO Send an event when a signal has been received.
        for (const signal of Signals) {
            this.logger.debug("listen", signal);
            process.on(signal, async () => this.dispose());
        }
    }

    public static on(event: "release", callback: DisposableFn): void {
        Disposable.attach(ref.ensure(), callback);
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
        return ref.create(() => new Runtime())
            .watch(queue);
    }

    public static createQueue(chain: (() => Promisify<unknown>)[]): Promise<unknown>[] {
        const queue = [];
        for (const callback of chain) {
            queue.push(new Promise<unknown>((resolve) => resolve(callback())));
        }

        return queue;
    }

    public async dispose(): Promise<void> {
        this.logger.info("dispose");

        setImmediate(async () => {
            await Disposable.disposeAll()
                .finally(() => this.logger.info("exit"))
                .finally(() => process.nextTick(() => process.exit(0)));
        });
    }

    private async watch(chain: Promise<unknown>[]): Promise<void> {
        const finish = this.logger.perf("run");
        try {
            for (const pending of chain) {
                await this.handle(pending);
            }

            await Promise.allSettled(this.queue.map((heartbeat) => heartbeat.watch()));
        } catch (error) {
            this.logger.emergency(error.message, error.stack);
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
                Disposable.attach(this, object);
            }
        } catch (error) {
            this.logger.error("reject", error);
        }
    }
}
