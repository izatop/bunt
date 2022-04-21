import {Redis} from "ioredis";
import {Message, MessageCtor, QueueReaderAbstract, ReadOperation} from "../Queue";
import {RedisTransport} from "./RedisTransport";

export class RedisQueueReader<M extends Message, MC extends MessageCtor<M>>
    extends QueueReaderAbstract<M, MC, ReadOperation<M>> {
    protected readonly timeout = 100;
    readonly #connection: Redis;
    readonly #transport: RedisTransport;

    constructor(transport: RedisTransport, type: MC) {
        super(type);
        this.#connection = transport.duplicate();
        this.#transport = transport;
    }

    protected get connection(): Redis {
        return this.#connection;
    }

    public async dispose(): Promise<void> {
        this.#connection.disconnect();
        await this.#transport.getConnectionState(this.#connection);
    }

    public async cancel(): Promise<void> {
        // not support
    }

    protected next(): Promise<string | undefined> {
        return this.wrap(this.#connection.brpop(this.channel, this.timeout)
            .then((message) => message?.[1]));
    }

    protected createReadOperation(message: M): ReadOperation<M> {
        return new ReadOperation(message);
    }

    protected wrap(result: Promise<string | undefined | null>): Promise<string | undefined> {
        return result.then((value) => value ?? undefined).catch(() => undefined);
    }
}
