import {isObject} from "@bunt/is";
import {Promisify} from "@bunt/type";
import {TypeAbstract} from "../TypeAbstract.js";
import {IScalarType} from "./ScalarType.js";

export type UnionSelector<TValue> = (input: unknown) => TypeAbstract<TValue> | undefined;

export class Union<TValue> extends TypeAbstract<TValue> {
    readonly #selector: UnionSelector<TValue>;
    readonly #name: string;

    constructor(config: {name?: string; selector: IScalarType<TValue>});
    constructor(selector: UnionSelector<TValue>);
    constructor(...args: any[]) {
        super();
        const [arg1, arg2] = args;
        if (isObject(arg1)) {
            this.#selector = arg1.selector;
            this.#name = arg1.name ?? "Union";
        } else {
            this.#selector = arg1;
            this.#name = arg2;
        }
    }

    public get name(): string {
        return this.#name;
    }

    public validate(input: unknown): Promisify<TValue> {
        const type = this.#selector.call(this, input);
        this.assert(!!type, `${this.name} type detection failed`, input);

        return type.validate(input) as Promisify<TValue>;
    }
}
