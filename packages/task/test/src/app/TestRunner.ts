import {Context, ContextArg} from "@bunt/unit";
import {ITask, TaskConfig, TaskPayload, TaskResult, Runner, RunnerConfig} from "../../../src";

export class TestRunner<C extends Context> extends Runner<C> {
    public static async factory<C extends Context>(context: ContextArg<C>, config?: RunnerConfig)
        : Promise<TestRunner<C>> {
        return new this<C>(await this.getContext(context), config);
    }

    public async enqueue(config: TaskConfig<C, any>, payload: TaskPayload<any, any>): Promise<void> {
        return super.enqueue(config, payload);
    }

    public getTaskUpgradeState(result: TaskResult<any> | void): Partial<ITask> {
        return super.getTaskUpgradeState(result);
    }
}
