import {AsyncState} from "@bunt/util";
import {
    Incoming,
    IQueueList,
    IQueueReader,
    IReadOperation,
    ITransport,
    Message,
    MessageCtor,
    MessageHandler,
    QueueList,
    ReadOperation,
} from "../../../src";

export class TestTransport implements ITransport {
    public readonly pending: Promise<unknown>[] = [];
    readonly #messages = new Map<string, Message[]>();

    public getQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): IQueueList<M> {
        return new QueueList(this, type, handler);
    }

    public getQueueReader<M extends Message>(type: MessageCtor<M>): IQueueReader<M> {
        const queue = this.ensure<M>(type.channel);
        const cancel = (): void => this.resolve();
        const listenNext = (): Promise<unknown> => {
            const state = AsyncState.acquire();
            this.pending.push(state);

            return state;
        };

        return {
            channel: type.channel,
            async read(): Promise<IReadOperation<M> | undefined> {
                const message = queue.shift();
                if (message) {
                    return new ReadOperation(message);
                }

                await listenNext();
            },
            async cancel(): Promise<void> {
                cancel();
            },
            dispose(): Promise<void> {
                return Promise.resolve();
            },
        };
    }

    public send<M extends Message>(message: M): void {
        const queue = this.ensure(message.channel);

        queue.push(message);
        this.resolve();
    }

    public size<M extends Incoming>(type: MessageCtor<M>): number {
        return this.ensure(type.channel).length;
    }

    public async dispose(): Promise<void> {
        this.resolve();
    }

    private ensure<M extends Message>(channel: string): M[] {
        const queue = this.#messages.get(channel) ?? [];
        if (!this.#messages.has(channel)) {
            this.#messages.set(channel, queue);
        }

        return queue as M[];
    }

    private resolve(): void {
        while (this.pending.length > 0) {
            AsyncState.resolve(this.pending.shift());
        }
    }
}
