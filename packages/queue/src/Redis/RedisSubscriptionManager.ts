import {Redis} from "ioredis";
import {RedisTransport} from "./RedisTransport";
import {SubscriptionManager} from "../PubSub";

export class RedisSubscriptionManager extends SubscriptionManager {
    readonly #transport: RedisTransport;
    readonly #connection: Redis;

    constructor(transport: RedisTransport) {
        super();
        this.#transport = transport;
        this.#connection = transport.duplicate();
        this.#connection.addListener("message", (channel, message) => {
            this.emit(channel, message);
        });
    }

    public async dispose(): Promise<void> {
        this.#connection.disconnect();
        await this.#transport.getConnectionState(this.#connection);
        await super.dispose();
    }

    protected async subscribe(channel: string): Promise<void> {
        this.logger.debug("subscribe(%s)", channel);
        await this.#connection.subscribe(channel);
    }

    protected async unsubscribe(channel: string): Promise<void> {
        this.logger.debug("unsubscribe(%s)", channel);
        await this.#connection.unsubscribe(channel);
    }
}
