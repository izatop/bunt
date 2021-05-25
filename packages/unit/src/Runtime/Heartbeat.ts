import {AsyncState, Logger, logger} from "@bunt/util";
import {HeartbeatDisposer, IRunnable} from "./interfaces";

const registry = new WeakMap<IRunnable, Heartbeat>();

export class Heartbeat {
    @logger
    protected readonly logger!: Logger;

    #beats = true;
    readonly #pending: Promise<void>;

    constructor(label: string, disposer?: HeartbeatDisposer) {
        this.logger.debug("create", {label});
        this.#pending = AsyncState.acquire<void>();

        if (disposer) {
            disposer((error) => this.destroy(error));
        }
    }

    public get beats(): boolean {
        return this.#beats;
    }

    /**
     * Always getting an unique Heartbeat of the target
     *
     * @param target
     * @param disposer
     */
    public static create(target: IRunnable, disposer?: HeartbeatDisposer): Heartbeat {
        const heartbeat = registry.get(target) ?? new Heartbeat(target.constructor.name, disposer);
        if (!registry.has(target)) {
            registry.set(target, heartbeat);
        }

        return heartbeat;
    }

    public static async watch(runnable: IRunnable): Promise<void> {
        const heartbeat = runnable.getHeartbeat();
        return heartbeat.watch();
    }

    public static destroy(target: IRunnable): void {
        const heartbeat = registry.get(target);
        heartbeat?.destroy();
    }

    public destroy(error?: Error): void {
        if (error) {
            return AsyncState.reject(this.#pending, error);
        }

        AsyncState.resolve(this.#pending);
    }

    public watch(): Promise<void> {
        return this.#pending;
    }
}
