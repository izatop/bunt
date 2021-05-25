import {Promisify} from "@bunt/util";
import {ApplyContext, Context} from "./Context";
import {StateType} from "./interfaces";

export abstract class Action<C extends Context, S extends StateType = null, R = unknown> {
    public readonly state: S;

    protected readonly context: ApplyContext<C>;

    constructor(context: ApplyContext<C>, state: S) {
        this.context = context;
        this.state = state;
    }

    public get name(): string {
        return this.constructor.name;
    }

    public abstract run(): Promisify<R>;
}
