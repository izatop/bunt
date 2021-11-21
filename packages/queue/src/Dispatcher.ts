import {ActionCtor, Context, ContextArg, Disposer, Heartbeat, IRunnable, unit, Unit} from "@bunt/unit";
import {Ctor, Defer, logger, Logger} from "@bunt/util";
import {Handler} from "./Handler";
import {ITransport} from "./interfaces";
import {Incoming, MessageCtor, Queue, QueueAbstract} from "./Queue";

export class Dispatcher<C extends Context> extends Disposer implements IRunnable {
    @logger
    public logger!: Logger;

    readonly #unit: Unit<C>;
    readonly #queue: QueueAbstract<ITransport>;
    readonly #route = new Map<MessageCtor<any>, ActionCtor<C>>();

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
        if (!this.#unit.has(action)) {
            this.#unit.add(action);
        }

        const subscription = this.#queue.on<any>(type, ({payload}) => this.#unit.run(action, {payload}));
        this.onDispose(subscription);

        return this;
    }
}
