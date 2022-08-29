import {Action, IRunnable, StateType} from "@bunt/unit";
import {Argv, Logger, Program} from "@bunt/util";
import {CommandContext} from "../Context/CommandContext";

export abstract class Command<C extends CommandContext,
    S extends StateType | null = null> extends Action<C, S, IRunnable | void> {

    @logger
    protected logger!: Logger;

    readonly #queue = new Set<Promise<unknown>>();

    public get args(): Argv {
        return this.context.args;
    }

    public get program(): Program {
        return this.context.program;
    }

    protected enqueue(job: Promise<unknown>): void {
        this.#queue.add(job);

        job.finally(() => this.#queue.delete(job));
    }

    protected async flush(): Promise<void> {
        await Promise.all([...this.#queue.values()]);
    }
}
