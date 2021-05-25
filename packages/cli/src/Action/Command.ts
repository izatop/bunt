import {Action, Disposable, Heartbeat, IDisposable, IRunnable, StateType} from "@bunt/unit";
import {Argv, Logger, logger, Program, Promisify} from "@bunt/util";
import {CommandContext} from "../Context/CommandContext";

export abstract class Command<C extends CommandContext,
    S extends StateType | null = null> extends Action<C, S, IRunnable>
    implements IDisposable, IRunnable {

    @logger
    protected logger!: Logger;

    public get args(): Argv {
        return this.context.args;
    }

    public get program(): Program {
        return this.context.program;
    }

    public async run(): Promise<IRunnable> {
        process.nextTick(() => this.execute());

        return this;
    }

    public abstract execute(): Promisify<void>;

    public getHeartbeat(): Heartbeat {
        return Heartbeat.create(this, (fn) => Disposable.attach(this, fn));
    }

    public async dispose(): Promise<void> {
        return;
    }
}
