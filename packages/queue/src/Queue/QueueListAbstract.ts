import {Disposer} from "@bunt/unit";
import {assert, isDefined, isInstanceOf, toError} from "@bunt/util";
import {ConcurrencyQueue} from "../Concurrency/ConcurrencyQueue.js";
import {ITransport} from "../interfaces.js";
import {
    IQueueList,
    IQueueListWatcher,
    IQueueReader,
    IReadOperation,
    Message,
    MessageCtor,
    MessageHandler,
    OperationReleaseState,
} from "./interfaces.js";
import {TaskAbstract} from "./Message/index.js";

export abstract class QueueListAbstract<M extends Message> extends Disposer implements IQueueList<M> {
    readonly #type: MessageCtor<M>;
    readonly #reader: IQueueReader<M>;
    readonly #transport: ITransport;
    readonly #handler: MessageHandler<M>;
    readonly #watchers: IQueueListWatcher<M>[] = [];
    readonly #queue: ConcurrencyQueue;

    #subscribed = true;
    #state?: Promise<void>;

    constructor(transport: ITransport, type: MessageCtor<M>, handler: MessageHandler<M>) {
        super();

        this.#type = type;
        this.#reader = transport.getQueueReader(type);
        this.#handler = handler;
        this.#transport = transport;
        this.#state = this.listen();
        this.#queue = new ConcurrencyQueue(type.concurrency);

        this.onDispose(this.#reader);
        this.onDispose(() => this.unsubscribe());
        this.onDispose(() => this.reset());
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

    protected async listen(): Promise<void> {
        while (this.#subscribed) {
            const readOperation = await this.#reader.read();
            if (readOperation) {
                await this.#queue.enqueue(() => this.handle(readOperation));
            }
        }

        await this.#queue.flush();
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
            await this.fire(operation.rollback(toError(error, "Unexpected error")));
        }
    }

    private async fire(operation: Promise<OperationReleaseState<M>>): Promise<void> {
        const value = await operation;
        this.#watchers.forEach((fn) => fn(value));
    }

    private reset(): void {
        this.#watchers.splice(0, this.#watchers.length);
    }
}
