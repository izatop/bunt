import {Disposable} from "@bunt/unit";
import {assert, isDefined, isInstanceOf} from "@bunt/util";
import {ITransport} from "../interfaces";
import {
    IQueueList,
    IQueueListWatcher,
    IQueueReader,
    IReadOperation,
    Message,
    MessageCtor,
    MessageHandler,
    OperationReleaseState,
} from "./interfaces";
import {TaskAbstract} from "./Message";

export abstract class QueueListAbstract<M extends Message> implements IQueueList<M> {
    readonly #type: MessageCtor<M>;
    readonly #reader: IQueueReader<M>;
    readonly #transport: ITransport;
    readonly #handler: MessageHandler<M>;
    readonly #watchers: IQueueListWatcher<M>[] = [];

    #subscribed = true;
    #state?: Promise<void>;

    constructor(transport: ITransport, type: MessageCtor<M>, handler: MessageHandler<M>) {
        this.#type = type;
        this.#reader = transport.createQueueReader(type);
        this.#handler = handler;
        this.#transport = transport;
        this.#state = this.listen();

        Disposable.attach(this, this.#reader);
        Disposable.attach(this, () => this.unsubscribe());
        Disposable.attach(this, () => this.reset());
    }

    public get subscribed(): boolean {
        return this.#subscribed;
    }

    public async subscribe(): Promise<void> {
        assert(!this.subscribed, `The ${this.#type.channel} channel already subscribed`);
        this.#subscribed = true;
        this.#state = this.listen();
    }

    public async unsubscribe(): Promise<void> {
        this.#subscribed = false;
        await this.#reader.cancel()
            .finally(() => this.#state);
    }

    public watch(fn: IQueueListWatcher<M>): () => void {
        this.#watchers.push(fn);
        return () => {
            this.#watchers.splice(this.#watchers.indexOf(fn), 1);
        };
    }

    public async dispose(): Promise<void> {
        return;
    }

    protected async listen(): Promise<void> {
        while (this.#subscribed) {
            const readOperation = await this.#reader.read();
            if (readOperation) {
                await this.handle(readOperation);
            }
        }
    }

    protected async handle(operation: IReadOperation<M>): Promise<void> {
        const {message} = operation;
        try {
            const reply = await this.#handler(message);
            if (isDefined(reply) && isInstanceOf(message, TaskAbstract)) {
                await this.#transport.send(message.reply(reply));
            }

            await this.fire(operation.commit());
        } catch (error) {
            await this.fire(operation.rollback(error));
        }
    }

    private async fire(operation: Promise<OperationReleaseState<M>>) {
        const value = await operation;
        this.#watchers.forEach((fn) => fn(value));
    }

    private reset() {
        this.#watchers.splice(0, this.#watchers.length);
    }
}
