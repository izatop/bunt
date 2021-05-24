import {
    ActionContextCtor,
    ActionCtor,
    ApplyContext,
    Context,
    ContextArg,
    Disposable,
    Heartbeat,
    IContext,
    IDisposable,
    IRunnable,
    unit,
    Unit,
} from "@bunt/unit";
import {logger, Logger} from "@bunt/util";
import {ActionHandler, ITransport} from "./interfaces";
import {Message, MessageCtor, MessageHandler, Queue, QueueAbstract} from "./Queue";

export class Dispatcher<C extends IContext> implements IDisposable, IRunnable {
    @logger
    public logger!: Logger;

    readonly #unit: Unit<C>;
    readonly #queue: QueueAbstract<ITransport>;
    readonly #route = new Map<MessageCtor<any>, ActionContextCtor<C, any>>();

    protected constructor(u: Unit<C>, queue: QueueAbstract<ITransport>) {
        this.#queue = queue;
        this.#unit = u;
    }

    public get size(): number {
        return this.#route.size;
    }

    public static async factory<C extends Context>(queue: Queue<ITransport>,
                                                   context: ContextArg<C>): Promise<Dispatcher<ApplyContext<C>>> {
        return new this(await unit(context), queue);
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this, (resolve) => Disposable.attach(this, resolve));
    }

    public subscribe<M extends Message>(type: MessageCtor<M>, action: ActionCtor<ActionHandler<C, M>>): this {
        this.#unit.add(action);

        const handler = ((message) => this.#unit.run(action, message)) as MessageHandler<M>;
        const subscription = this.#queue.subscribe(type, handler);
        Disposable.attach(this, subscription);

        return this;
    }

    public async dispose(): Promise<void> {
        return;
    }
}
