import {Defer, Logger, logger} from "@bunt/util";
import {HeartbeatDisposer, IRunnable} from "./interfaces";
import {isRunnable} from "./internal";

const registry = new WeakMap<IRunnable, Heartbeat>();

export class Heartbeat {
    @logger
    protected readonly logger!: Logger;

    readonly #life = new Defer<void>();

    constructor(label: string, disposer?: HeartbeatDisposer) {
        this.logger.debug("create", {label});

        if (disposer) {
            disposer((error) => this.destroy(error));
        }
    }

    public get beats(): boolean {
        return !this.#life.settled;
    }

    /**
     * Always getting an unique Heartbeat of the target
     *
     * @param target
     * @param disposer
     */
    public static create(target: IRunnable, disposer?: HeartbeatDisposer): Heartbeat {
        const heartbeat = registry.get(target) ?? new Heartbeat(target.constructor.name, (resolve) => {
            registry.delete(target);

            disposer?.(resolve);
        });

        if (!registry.has(target)) {
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

    public static destroy(target: IRunnable): void {
        registry
            .get(target)
            ?.destroy();
    }

    public destroy(error?: Error): void {
        if (this.#life.settled) {
            return;
        }

        if (error) {
            return this.#life.reject(error);
        }

        this.#life.resolve();
    }

    public watch(): Promise<void> {
        return Promise.resolve(this.#life);
    }
}
