import {Heartbeat, IDisposable, IRunnable} from "@bunt/unit";
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

    constructor(name: string) {
        this.name = name;
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this);
    }

    public async dispose(): Promise<void> {
        return;
    }
}
