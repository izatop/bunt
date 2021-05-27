import {Disposable, IDisposable} from "@bunt/unit";
import {ITransport} from "../interfaces";
import {Incoming, IQueueList, Message, MessageCtor, MessageHandler} from "./interfaces";

export abstract class QueueAbstract<Q extends ITransport> implements IDisposable {
    readonly #transport: Q;

    constructor(transport: Q) {
        this.#transport = transport;

        Disposable.attach(this, transport);
    }

    public async send<M extends Message>(message: M): Promise<void> {
        await this.#transport.send(message);
    }

    public subscribe<M extends Incoming>(type: MessageCtor<M>, handler: MessageHandler<M>): IQueueList<M> {
        return this.#transport.createQueueList(type, handler);
    }

    public async dispose(): Promise<void> {
        return;
    }
}
