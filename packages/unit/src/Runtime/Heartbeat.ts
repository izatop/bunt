import {AsyncState} from "@bunt/util";
import {HeartbeatDisposer, IRunnable} from "./interfaces";

const registry = new WeakMap<any, Heartbeat>();

export class Heartbeat {
    #beats = true;

    readonly #pending: Promise<void>;

    constructor(disposer?: HeartbeatDisposer) {
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
    public static create(target: unknown, disposer?: HeartbeatDisposer): Heartbeat {
        const heartbeat = registry.get(target) ?? new Heartbeat(disposer);
        if (!registry.has(target)) {
            registry.set(target, heartbeat);
        }

        return heartbeat;
    }

    public static async watch(runnable: IRunnable): Promise<void> {
        const heartbeat = runnable.getHeartbeat();
        return heartbeat.watch();
    }

    public static destroy(target: unknown): void {
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
