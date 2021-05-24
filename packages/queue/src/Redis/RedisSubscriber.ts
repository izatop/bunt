import {IDisposable} from "@bunt/unit";
import {assert, Fn} from "@bunt/util";
import {Redis} from "ioredis";
import {ISubscriber} from "../PubSub/interfaces";

export class RedisSubscriber implements ISubscriber, IDisposable {
    public readonly channel: string;
    readonly #listeners = new Set<(...args: any[]) => unknown>();
    readonly #connection: Redis;

    constructor(connection: Redis, channel: string) {
        this.channel = channel;
        this.#connection = connection;
    }

    public listen(listener: (data: string) => unknown): Fn {
        assert(this.#connection.status !== "end");
        const handle = (channel: string, message: string) => {
            if (channel === this.channel) {
                listener(message);
            }
        };

        this.#listeners.add(handle);
        this.#connection.addListener("message", handle);

        return () => {
            this.#listeners.delete(handle);
            this.#connection.removeListener("message", handle);
        };
    }

    public async subscribe(): Promise<void> {
        await this.#connection.subscribe(this.channel);
    }

    public async unsubscribe(): Promise<void> {
        assert(this.#connection.status !== "end");
        await this.#connection.unsubscribe(this.channel)
            .catch((error) => this.close(error));
    }

    public async dispose(): Promise<void> {
        this.close();
    }

    public close(reason?: string | Error): void {
        if (reason) {
            console.error(reason);
        }

        this.#connection.unsubscribe(this.channel)
            .finally(() => {
                this.reset();
                this.#connection.disconnect();
            });
    }

    private reset() {
        for (const handle of this.#listeners.values()) {
            this.#listeners.delete(handle);
            this.#connection.removeListener("message", handle);
        }
    }
}
