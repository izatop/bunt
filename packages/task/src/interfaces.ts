import {ApplyContext, Context} from "@bunt/unit";
import {Ctor} from "@bunt/type";
import {TaskIterator} from "./TaskIterator.js";
import {ConcurrencyLimiter, FixedWindowLimiter} from "./Limiter/index.js";
import {TaskAbstract} from "./TaskAbstract.js";

export enum TaskState {
    READY,
    RUNNING,
    REJECTED,
    DONE,
}

export interface ITask<R = unknown> {
    ns?: string;
    state: TaskState;
    runAt: Date;
    lastRunAt?: Date;
    runner?: string;
    fails?: number;
    reason?: string;
    result?: R;
}

export interface ITaskResult<R = unknown> {
    reason?: string;
    result?: R;
}

export interface ITaskDone<R = unknown> extends ITaskResult<R> {
    state: TaskState.DONE;
}

export interface ITaskReject<R = unknown> extends ITaskResult<R> {
    state: TaskState.REJECTED;
}

export interface ITaskSchedule<R = unknown> extends ITaskResult<R> {
    state: TaskState.READY;
    date: Date;
}

export type TaskResult<R = unknown> = ITaskDone<R> | ITaskReject<R> | ITaskSchedule<R> | ITaskResult<R>;

export type TaskPayload<T extends Record<any, any>, R = unknown> = {
    payload: T;
    task: ITask<R>;
};

export type TaskIteratorFactory<C extends Context, S extends Record<any, any>> = {
    (context: ApplyContext<C>): Promise<TaskIterator<S>>;
};

export type TaskDisposer<C extends Context, S extends Record<any, any>> = {
    (context: ApplyContext<C>, task: ITask, payload: S): Promise<void>;
};

export type TaskConfig<C extends Context, S extends Record<any, any>> = {
    action: Ctor<TaskAbstract<C, S>>;
    factory: TaskIteratorFactory<C, S>;
    dispose?: TaskDisposer<C, S>;
    options?: TaskOptions;
};

type LimiterList = FixedWindowLimiter | ConcurrencyLimiter;

export type TaskOptions = {
    limiter?: LimiterList | LimiterList[];
    retries?: {
        exp?: true;
        intervalMs: number;
        max: number;
    };
};

export type TaskPoll<T extends TaskPayload<any, any>> = () => Promise<T | undefined>;
export type TaskPollDispose<> = () => Promise<void>;

export type RunnerConfig = {
    polling: false | {
        interval: number;
    };
};
