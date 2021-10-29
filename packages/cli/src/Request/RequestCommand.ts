import {RequestAbstract} from "@bunt/app";
import {Argv, assert} from "@bunt/util";
import {Headers} from "./Headers";

export class RequestCommand extends RequestAbstract {
    public readonly headers = new Headers([]);
    public readonly route: string;

    constructor(args: Argv) {
        super();
        const [command] = args.getArgs();
        assert(command, "Command should be defined");

        this.route = command;
    }

    public createReadableStream(): NodeJS.ReadableStream {
        return process.stdin;
    }

    public validate(): boolean {
        return true;
    }
}
