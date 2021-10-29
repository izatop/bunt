import {Argv} from "./Argv";

export class Program {
    public readonly args: Argv;

    constructor(argv?: string[]) {
        this.args = new Argv(argv || process.argv.slice(2));
    }

    public get stdin(): NodeJS.ReadStream & {fd: 0} {
        return process.stdin;
    }

    public get stdout(): NodeJS.WriteStream & {fd: 1} {
        return process.stdout;
    }

    public get stderr(): NodeJS.WriteStream & {fd: 2} {
        return process.stderr;
    }
}
