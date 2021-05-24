import {assert, isNull, isUndefined, Logger, logger, Promisify, SingleRef} from "@bunt/util";
import {Disposable, dispose} from "../Application";
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

    #disposed = false;

    private constructor() {
        this.created = new Date();
        this.logger.info("register", {ENV, DEBUG});

        // @TODO Send an event when a signal has been received.
        for (const signal of Signals) {
            this.logger.debug("listen", signal);
            process.on(signal, async () => this.online && this.dispose());
        }
    }

    public get online(): boolean {
        return !this.#disposed;
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

    public static run(...chain: ((runtime: Runtime) => Promisify<unknown>)[]): Promise<void> {
        const runtime = ref.create(() => new Runtime());

        return runtime.run(...chain);
    }

    public async accept(result: unknown): Promise<void> {
        const done = await result;
        if (isUndefined(done) || isNull(done)) {
            return;
        }

        if (isDisposable(done)) {
            Disposable.attach(this, done);
        }

        if (isRunnable(done)) {
            this.queue.push(done.getHeartbeat());
        }
    }

    public async dispose(): Promise<void> {
        this.logger.info("dispose");
        assert(this.online, "Runtime has been already released");
        process.exit(0);
    }

    private async run(...chain: ((runtime: Runtime) => Promisify<unknown>)[]): Promise<void> {
        const finish = this.logger.perf("run");
        try {
            for (const callback of chain) {
                await this.accept(callback(this));
            }

            await Promise.allSettled(this.queue.map((hb) => hb.watch()));
        } catch (error) {
            this.logger.emergency(error.message, error.stack);
        } finally {
            finish();
        }

        if (this.online) {
            process.nextTick(() => dispose(this));
        }
    }
}
