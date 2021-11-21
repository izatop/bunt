import {Heartbeat, IDisposable, IRunnable} from "@bunt/unit";
import {Defer} from "@bunt/util";
import {Command} from "../../../../src";
import {BaseContext} from "../Context/BaseContext";

export class BaseTestCommand extends Command<BaseContext, {name?: string}> {
    public run(): void | Result {
        if (this.state.name) {
            return new Result(this.state.name);
        }

        return;
    }
}

export class Result implements IRunnable, IDisposable {
    public readonly name: string;
    public readonly job = new Defer<void>();

    constructor(name: string) {
        this.name = name;
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this)
            .enqueue(this.job)
            .onDispose(this);
    }

    public async dispose(): Promise<void> {
        this.job.resolve();

        return;
    }
}
