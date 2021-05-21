import {Argv} from "../Node";

export class ConsoleArgs {
    public readonly argv: Argv;

    constructor(argv?: string[]) {
        this.argv = new Argv(argv || process.argv.slice(2));
    }
}
