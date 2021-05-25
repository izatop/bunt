import {EventEmitter} from "events";
import {Heartbeat, IRunnable} from "../../../src";

export class RunnableTest extends EventEmitter implements IRunnable {
    declare on: (event: "resolve", fn: (error?: Error) => void) => this;

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this, (resolve) => this.on("resolve", resolve));
    }

    public crash(): void {
        this.emit("resolve", new Error("Crashes"));
    }

    public destroy(): void {
        this.emit("resolve");
    }
}
