import {Heartbeat, IRunnable} from "../../../src";

export class RunnableTarget implements IRunnable {
    public getHeartbeat(): Heartbeat {
        let timer: NodeJS.Timeout | undefined;
        const job = new Promise((resolve) => {
            timer = setTimeout(resolve, 5000);
        });

        const finalize = () => timer && clearTimeout(timer);

        return Heartbeat.create(this)
            .enqueue(job)
            .onDispose(finalize);
    }
}
