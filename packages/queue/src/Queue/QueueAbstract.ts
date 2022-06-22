import {Disposer} from "@bunt/unit";
import {ITransport} from "../interfaces";
import {Incoming, IQueueList, Message, MessageCtor, MessageHandler} from "./interfaces";

export abstract class QueueAbstract<Q extends ITransport> extends Disposer {
    readonly #transport: Q;

    constructor(transport: Q) {
        super();

        this.#transport = transport;
        this.onDispose(transport);
    }

    public async send<M extends Message>(message: M): Promise<void> {
        await this.#transport.send(message);
    }

    public async size<M extends Message>(message: M): Promise<void> {
        await this.#transport.size(message);
    }

    /**
     * @deprecated
     * @param type
     * @param handler
     */
    public subscribe<M extends Incoming>(type: MessageCtor<M>, handler: MessageHandler<M>): IQueueList<M> {
        return this.on(type, handler);
    }

    public on<M extends Incoming>(type: MessageCtor<M>, handler: MessageHandler<M>): IQueueList<M> {
        return this.#transport.getQueueList(type, handler);
    }
}
