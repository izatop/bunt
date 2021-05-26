import {Action, IRunnable, StateType} from "@bunt/unit";
import {Argv, Logger, logger, Program} from "@bunt/util";
import {CommandContext} from "../Context/CommandContext";

export abstract class Command<C extends CommandContext,
    S extends StateType | null = null> extends Action<C, S, IRunnable | void> {

    @logger
    protected logger!: Logger;

    public get args(): Argv {
        return this.context.args;
    }

    public get program(): Program {
        return this.context.program;
    }
}
