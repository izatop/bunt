import {KeyValueMap, RequestAbstract} from "@bunt/app";
import {Argv} from "@bunt/util";
import {assert} from "@bunt/assert";
import {Headers} from "./Headers.js";

export class RequestCommand extends RequestAbstract {
    public readonly params = new KeyValueMap([]);
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
