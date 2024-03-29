import {
    ActionFactory,
    ActionTransactionHandlers,
    Context,
    ContextArg,
    Disposer,
    Heartbeat,
    IRunnable,
    Unit,
    unit,
} from "@bunt/unit";
import {Ctor, Defer, logger, Logger} from "@bunt/util";
import {Handler} from "./Handler.js";
import {ITransport} from "./interfaces.js";
import {Incoming, MessageCtor, Queue, QueueAbstract} from "./Queue/index.js";

export class Dispatcher<C extends Context> extends Disposer implements IRunnable {
    @logger
    declare public readonly logger: Logger;

    readonly #unit: Unit<C>;
    readonly #queue: QueueAbstract<ITransport>;
    readonly #route = new Map<MessageCtor<any>, ActionFactory<any>>();

    protected constructor(u: Unit<C>, queue: QueueAbstract<ITransport>) {
        super();

        this.#unit = u;
        this.#queue = queue;
        this.onDispose(queue);
    }

    public get size(): number {
        return this.#route.size;
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>, queue: Queue<ITransport>): Promise<Dispatcher<C>> {

        return new this(await unit(context), queue);
    }

    public getHeartbeat(): Heartbeat {
        const running = new Defer<void>();
        this.onDispose(() => running.resolve());

        return Heartbeat.create(this)
            .enqueue(running)
            .onDispose(this);
    }

    public subscribe<M extends Incoming, H extends Handler<C, M>>(type: MessageCtor<M>, action: Ctor<H>): this {
        const subscription = this.#queue.on<any>(type, ({payload}) => this.#unit.run(action, {payload}));
        subscription.watch((op) => {
            const {error} = this.#unit.getTransactionHandlers();
            if (error && !op.status) {
                error(op.error, this.#unit.context);
            }
        });

        this.onDispose(subscription);

        return this;
    }

    public on(handlers: ActionTransactionHandlers<C>): void {
        this.#unit.on(handlers);
    }
}
