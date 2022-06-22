import {Disposer, IDisposable} from "@bunt/unit";
import {Defer} from "@bunt/util";
import {Redis, RedisOptions} from "ioredis";
import {ITransport} from "../interfaces";
import {IPubSubTransport} from "../PubSub";
import {Incoming, isTransactionMessage, Message, MessageCtor, MessageHandler, serialize} from "../Queue";
import {createConnection} from "./fn";
import {RedisQ2Reader} from "./RedisQ2Reader";
import {RedisQueueList} from "./RedisQueueList";
import {RedisQueueReader} from "./RedisQueueReader";
import {RedisSubscriptionManager} from "./RedisSubscriptionManager";

export class RedisTransport extends Disposer implements ITransport, IPubSubTransport {
    readonly #connection: Redis;
    readonly #clients = new WeakMap<Redis, Defer<void>>();

    #connections = 0;
    #subscriptionManager?: RedisSubscriptionManager;

    constructor(dsn?: string, options?: RedisOptions) {
        super();
        this.#connection = this.watch(createConnection(dsn, options));
    }

    public get connection(): Redis {
        return this.#connection;
    }

    public duplicate(): Redis {
        return this.watch(this.#connection.duplicate());
    }

    public getConnectionState(connection: Redis): Defer<void> | undefined {
        return this.#clients.get(connection);
    }

    public get connections(): number {
        return this.#connections;
    }

    public async send<M extends Message>(message: M): Promise<void> {
        this.logger.debug("send(%s, %o)", message.channel, message.payload);
        await this.#connection.lpush(message.channel, serialize(message));
    }

    public async publish(channel: string, message: string): Promise<void> {
        this.logger.debug("publish(%s, %s)", channel, message);
        await this.#connection.publish(channel, message);
    }

    public async size<M extends Incoming>(type: MessageCtor<M>): Promise<number> {
        return this.#connection.llen(type.channel);
    }

    public getQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): RedisQueueList<M> {
        return this.register(new RedisQueueList(this, type, handler));
    }

    public getQueueReader<M extends Message>(type: MessageCtor<M>): RedisQueueReader<M, MessageCtor<M>> {
        if (isTransactionMessage(type)) {
            return this.register(new RedisQ2Reader(this, type));
        }

        return this.register(new RedisQueueReader(this, type));
    }

    public async getSubscriptionManager(): Promise<RedisSubscriptionManager> {
        if (!this.#subscriptionManager) {
            this.logger.debug("getSubscriptionManager(): new RedisSubscriptionManager()");
            this.#subscriptionManager = this.register(new RedisSubscriptionManager(this));
        }

        return this.#subscriptionManager;
    }

    public async dispose(): Promise<void> {
        this.#connection.disconnect();
        await this.getConnectionState(this.#connection);
        await super.dispose();
    }

    private watch(connection: Redis): Redis {
        this.logger.debug("connection(watch)");

        const connectionState = new Defer<void>();
        this.#clients.set(connection, connectionState);

        return connection
            .on("error", (error) => this.logger.error(error.message, error))
            .once("connect", () => this.#connections++)
            .once("close", () => {
                this.#connections--;
                this.#clients.delete(connection);
                connectionState.resolve();

                this.logger.debug("connection(end)");
            });
    }

    private register<T extends IDisposable>(value: T): T {
        this.onDispose(value);

        return value;
    }
}
