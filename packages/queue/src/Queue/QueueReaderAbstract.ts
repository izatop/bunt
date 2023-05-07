import {tryUnserialize} from "./fn.js";
import {IQueueReader, IReadOperation, Message, MessageCtor} from "./interfaces.js";

export abstract class QueueReaderAbstract<M extends Message,
    MC extends MessageCtor<M>,
    RO extends IReadOperation<M>> implements IQueueReader<M, RO> {
    readonly #type: MC;

    constructor(type: MC) {
        this.#type = type;
    }

    public get channel(): string {
        return this.#type.channel;
    }

    protected get type(): MC {
        return this.#type;
    }

    public abstract cancel(): Promise<void>;

    public abstract dispose(): Promise<void>;

    public async read(): Promise<RO | undefined> {
        const message = tryUnserialize(this.type, await this.next());
        if (message) {
            return this.createReadOperation(new this.#type(message));
        }
    }

    protected abstract next(): Promise<string | undefined>;

    protected abstract createReadOperation(message: M): RO;
}
