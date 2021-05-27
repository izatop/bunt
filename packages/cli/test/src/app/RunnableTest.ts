import {Heartbeat, IDisposable, IRunnable} from "@bunt/unit";

export class RunnableTest implements IRunnable, IDisposable {
    public async dispose(): Promise<void> {
        return;
    }

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this);
    }

}
