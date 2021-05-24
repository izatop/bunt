import {Disposable, IDisposable} from "@bunt/unit";
import {Redis} from "ioredis";
import {ITransport} from "../interfaces";
import {IPubSubTransport, ISubscriber} from "../PubSub";
import {isTransactionMessage, Message, MessageCtor, MessageHandler, serialize} from "../Queue";
import {createConnection} from "./fn";
import {RedisQ2Reader} from "./RedisQ2Reader";
import {RedisQueueList} from "./RedisQueueList";
import {RedisQueueReader} from "./RedisQueueReader";
import {RedisSubscriber} from "./RedisSubscriber";

export class RedisTransport implements ITransport, IPubSubTransport {
    readonly #connection: Redis;

    constructor(dsn?: string) {
        this.#connection = createConnection(dsn);
        Disposable.attach(this, () => this.#connection.disconnect());
    }

    public get connection(): Redis {
        return this.#connection;
    }

    public duplicate(): Redis {
        return this.#connection.duplicate();
    }

    public async send<M extends Message>(message: M): Promise<void> {
        await this.#connection.lpush(message.channel, serialize(message));
    }

    public publish(channel: string, message: string): Promise<number> {
        return this.#connection.publish(channel, message);
    }

    public async subscribe(channel: string): Promise<ISubscriber> {
        const subscriber = new RedisSubscriber(this.duplicate(), channel);
        Disposable.attach(this, subscriber);

        return subscriber;
    }

    public createQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): RedisQueueList<M> {
        return this.register(new RedisQueueList(this, type, handler));
    }

    public createQueueReader<M extends Message>(type: MessageCtor<M>): RedisQueueReader<M, MessageCtor<M>> {
        if (isTransactionMessage(type)) {
            return this.register(new RedisQ2Reader(this, type));
        }

        return this.register(new RedisQueueReader(this, type));
    }

    public async dispose(): Promise<void> {
        return;
    }

    private register<T extends IDisposable>(value: T): T {
        Disposable.attach(this, value);

        return value;
    }
}
