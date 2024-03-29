import {logger, Logger} from "@bunt/util";
import {Defer} from "@bunt/async";
import {Disposer} from "../Dispose/index.js";
import {HeartbeatRunningQueue, IRunnable} from "./interfaces.js";
import {isRunnable} from "./internal.js";

const registry = new WeakMap<IRunnable, Heartbeat>();

export class Heartbeat extends Disposer {
    public readonly name: string;

    @logger
    declare protected readonly logger: Logger;

    readonly #running = new Set<HeartbeatRunningQueue>();
    readonly #life = new Defer<void>();

    private constructor(target: IRunnable) {
        super();
        this.name = target.constructor.name;
        this.logger.debug("create", {label: this.name});
    }

    public static create(target: IRunnable): Heartbeat {
        const heartbeat = registry.get(target) ?? new Heartbeat(target);
        if (!registry.has(target)) {
            // prevent the getHeartbeat() function to be called more than one time
            Object.defineProperty(target, "getHeartbeat", {value: () => heartbeat});

            heartbeat.onDispose(() => {
                registry.delete(target);
            });

            registry.set(target, heartbeat);
        }

        return heartbeat;
    }

    public static async watch(runnable: IRunnable | unknown): Promise<void> {
        if (isRunnable(runnable)) {
            return runnable
                .getHeartbeat()
                .watch();
        }
    }

    public enqueue(...running: HeartbeatRunningQueue[]): this {
        for (const job of running) {
            this.#running.add(job);

            Promise.resolve(job)
                .catch((error) => this.reject(error))
                .finally(() => this.finalize(job));
        }

        return this;
    }

    public get beats(): boolean {
        return !this.#life.settled;
    }

    public async dispose(): Promise<void> {
        if (this.#life.settled) {
            return;
        }

        this.#life.resolve();
        await super.dispose();
    }

    public watch(): Promise<void> {
        return Promise.resolve(this.#life);
    }

    private reject(error: unknown): void {
        this.#running.clear();
        this.#life.reject(error);
    }

    private finalize(running: HeartbeatRunningQueue): void {
        this.#running.delete(running);
        if (this.#running.size === 0) {
            this.#life.resolve();
        }
    }
}
