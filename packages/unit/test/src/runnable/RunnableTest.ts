import {Defer} from "@bunt/util";
import {Heartbeat, IDisposable, IRunnable} from "../../../src";

export class RunnableTest implements IRunnable, IDisposable {
    readonly running = new Defer<void>();

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this)
            .onDispose(this)
            .enqueue(this.running);
    }

    public crash(): void {
        this.running.reject(new Error("Unexpected error"));
    }

    public async dispose(): Promise<void> {
        this.running.resolve();
    }
}
