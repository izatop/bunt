import {Disposable, IDisposable} from "@bunt/unit";
import {wait} from "@bunt/util";
import {Redis} from "ioredis";
import {ITransport} from "../interfaces";
import {IPubSubTransport} from "../PubSub";
import {isTransactionMessage, Message, MessageCtor, MessageHandler, serialize} from "../Queue";
import {createConnection} from "./fn";
import {RedisQ2Reader} from "./RedisQ2Reader";
import {RedisQueueList} from "./RedisQueueList";
import {RedisQueueReader} from "./RedisQueueReader";
import {RedisSubscriptionManager} from "./RedisSubscriptionManager";

export class RedisTransport implements ITransport, IPubSubTransport {
    readonly #connection: Redis;
    #connections = 0;
    #subscriptionManager?: RedisSubscriptionManager;

    constructor(dsn?: string) {
        this.#connection = createConnection(dsn)
            .once("connect", () => this.#connections++)
            .once("close", () => this.#connections--);
    }

    public get connection(): Redis {
        return this.#connection;
    }

    public duplicate(): Redis {
        return this.#connection
            .duplicate()
            .once("connect", () => this.#connections++)
            .once("close", () => this.#connections--);
    }

    public get connections() {
        return this.#connections;
    }

    public async send<M extends Message>(message: M): Promise<void> {
        await this.#connection.lpush(message.channel, serialize(message));
    }

    public publish(channel: string, message: string): Promise<number> {
        return this.#connection.publish(channel, message);
    }

    public async getSubscriptionManager(): Promise<RedisSubscriptionManager> {
        if (!this.#subscriptionManager) {
            this.#subscriptionManager = new RedisSubscriptionManager(this.duplicate());

            Disposable.attach(this, this.#subscriptionManager);
        }

        return this.#subscriptionManager;
    }

    /**
     * @deprecated use getQueueList
     * @param type MessageCtor<M>
     * @param handler MessageHandler<M>
     * @returns RedisQueueList<M>
     */
    public createQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): RedisQueueList<M> {
        return this.getQueueList(type, handler);
    }

    public getQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): RedisQueueList<M> {
        return this.register(new RedisQueueList(this, type, handler));
    }

    /**
     * @deprecated use getQueueReader
     * @param type MessageCtor<M>
     * @returns RedisQueueReader<M, MessageCtor<M>>
     */
    public createQueueReader<M extends Message>(type: MessageCtor<M>): RedisQueueReader<M, MessageCtor<M>> {
        return this.getQueueReader(type);
    }

    public getQueueReader<M extends Message>(type: MessageCtor<M>): RedisQueueReader<M, MessageCtor<M>> {
        if (isTransactionMessage(type)) {
            return this.register(new RedisQ2Reader(this, type));
        }

        return this.register(new RedisQueueReader(this, type));
    }

    public async dispose(): Promise<void> {
        return wait((fn) => this.#connection.once("close", fn).disconnect());
    }

    private register<T extends IDisposable>(value: T): T {
        Disposable.attach(this, value);

        return value;
    }
}
