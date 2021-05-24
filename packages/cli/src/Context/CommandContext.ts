import {ApplyContext, Context} from "@bunt/unit";
import {Argv, Program} from "@bunt/util";

export class CommandContext extends Context {
    public readonly program: Program;

    constructor(argv?: string[]) {
        super();
        this.program = new Program(argv);
    }

    public get args(): Argv {
        return this.program.args;
    }
}

export type ICommandContext = ApplyContext<CommandContext>;
