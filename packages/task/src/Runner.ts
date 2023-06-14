import {Action, ApplyContext, Context, ContextArg, Heartbeat, IDisposable, IRunnable, Unit} from "@bunt/unit";
import {isArray} from "@bunt/is";
import {toError} from "@bunt/assert";
import {timeout} from "@bunt/async";
import {ITask, RunnerConfig, TaskConfig, TaskPayload, TaskResult, TaskState} from "./interfaces";



export class Runner<C extends Context> extends Unit<C> implements IRunnable, IDisposable {
    readonly #tasks = new Set<TaskConfig<C, any>>();
    readonly #config: RunnerConfig;

    constructor(context: ApplyContext<C>, config?: Partial<RunnerConfig>) {
        super(context);
        this.#config = {polling: {interval: 10000}, ...config};
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this)
            .onDispose(this);
    }

    public static async factory<C extends Context>(context: ContextArg<C>, config?: RunnerConfig): Promise<Runner<C>> {
        return new this<C>(await this.getContext(context), config);
    }

    public register(config: TaskConfig<C, any>): this {
        this.#tasks.add(config);

        return this;
    }

    public async handle(): Promise<void> {
        const ops = [];
        for (const config of this.#tasks.values()) {
            ops.push(this.#process(config));
        }

        await Promise.all(ops);
    }

    public async dispose(): Promise<void> {
        this.getHeartbeat().dispose();
    }

    async #process(config: TaskConfig<C, any>): Promise<void> {
        const {polling} = this.#config;
        const {factory, options: queue = {limiter: []}} = config;

        const ops = new Set<Promise<void>>();
        const heartbeat = this.getHeartbeat();
        const limiters = isArray(queue.limiter) ? queue.limiter : (queue.limiter ? [queue.limiter] : []);

        do {
            const iterator = await factory(this.context);

            for await (const payload of iterator) {
                const op = this.enqueue(config, payload);
                ops.add(op);
                op.finally(() => ops.delete(op));

                if (limiters.length) {
                    await Promise.all(limiters.map((limiter) => limiter.enqueue(op)));
                }

                if (heartbeat.beats) {
                    break;
                }
            }

            if (polling && heartbeat.beats) {
                await timeout(polling.interval);
            }
        } while (polling && heartbeat.beats);

        await Promise.all([...ops.values()]);
    }

    protected async enqueue(config: TaskConfig<C, any>, state: TaskPayload<any, any>): Promise<void> {
        const {action, dispose, options = {}} = config;
        const nextState: ITask = {
            ...state.task,
            lastRunAt: new Date(),
            state: TaskState.DONE,
        };

        try {
            type A = Action<C, TaskPayload<any, any>, TaskResult<any> | void>;
            const result = await this.run<A>(action, state);

            Object.assign(nextState, this.getTaskUpgradeState(result));
        } catch (reason) {
            const fails = (nextState.fails ?? 0) + 1;
            const upgradeState: Partial<ITask> = {
                fails,
                state: TaskState.REJECTED,
                reason: toError(reason).toString(),
            };

            if (options.retries && fails <= options.retries.max) {
                const {intervalMs, exp} = options.retries;
                const nextIntervalMs = exp
                    ? Math.ceil(intervalMs * Math.exp(fails - 1))
                    : intervalMs;

                const schedule: Partial<ITask> = {
                    state: TaskState.READY,
                    runAt: new Date(Date.now() + nextIntervalMs),
                };

                Object.assign(upgradeState, schedule);
            }

            Object.assign(nextState, upgradeState);
        }

        await dispose?.(this.context, nextState, state.payload);
    }

    protected getTaskUpgradeState(result: TaskResult<any> | void): Partial<ITask> {
        if (!result) {
            return {state: TaskState.DONE};
        }

        if (!("state" in result)) {
            return {state: TaskState.DONE, ...result};
        }

        switch (result.state) {
            case TaskState.READY:
                return {
                    state: result.state,
                    reason: result.reason,
                    result: result.result,
                    runAt: result.date,
                };

            default:
                return result;
        }
    }
}
