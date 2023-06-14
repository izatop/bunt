import {Action, Context} from "@bunt/unit";
import {ITask, TaskPayload, TaskResult} from "./interfaces";

export abstract class TaskAbstract<C extends Context, S extends Record<any, any>, R = unknown>
    extends Action<C, TaskPayload<S, R>, TaskResult<R> | void> {
    public get payload(): S {
        return this.state.payload;
    }

    public get task(): ITask<R> {
        return this.state.task;
    }

    public abstract run(): Promise<TaskResult<R> | void>;
}
