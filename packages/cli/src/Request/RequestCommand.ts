import {RequestAbstract} from "@bunt/app";
import {assert, ConsoleArgs} from "@bunt/util";
import {Headers} from "./Headers";

export class RequestCommand extends RequestAbstract {
    public readonly headers = new Headers([]);
    public readonly route: string;

    constructor(argv?: string[]) {
        super();
        const consoleArgs = new ConsoleArgs(argv);
        const [command] = consoleArgs.argv.getArgs();
        assert(command, `Command should be defined`);

        this.route = command;
    }

    public createReadableStream(): NodeJS.ReadableStream {
        return process.stdin;
    }

    public validate(): boolean {
        return true;
    }
}
