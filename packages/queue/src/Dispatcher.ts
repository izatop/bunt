import {ActionCtor, Context, ContextArg, Disposable, Heartbeat, IDisposable, IRunnable, unit, Unit} from "@bunt/unit";
import {Ctor, logger, Logger} from "@bunt/util";
import {Handler} from "./Handler";
import {ITransport} from "./interfaces";
import {Incoming, MessageCtor, Queue, QueueAbstract} from "./Queue";

export class Dispatcher<C extends Context> implements IDisposable, IRunnable {
    @logger
    public logger!: Logger;

    readonly #unit: Unit<C>;
    readonly #queue: QueueAbstract<ITransport>;
    readonly #route = new Map<MessageCtor<any>, ActionCtor<C>>();

    protected constructor(u: Unit<C>, queue: QueueAbstract<ITransport>) {
        this.#queue = queue;
        this.#unit = u;
    }

    public get size(): number {
        return this.#route.size;
    }

    public static async factory<C extends Context>(
        context: ContextArg<C>, queue: Queue<ITransport>): Promise<Dispatcher<C>> {
        return new this(await unit(context), queue);
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this);
    }

    public subscribe<M extends Incoming, H extends Handler<C, M>>(type: MessageCtor<M>, action: Ctor<H>): this {
        if (!this.#unit.has(action)) {
            this.#unit.add(action);
        }

        const subscription = this.#queue.subscribe<any>(type, ({payload}) => this.#unit.run(action, {payload}));
        Disposable.attach(this, subscription);

        return this;
    }

    public async dispose(): Promise<void> {
        return;
    }
}
