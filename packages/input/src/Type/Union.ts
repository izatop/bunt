import {Promisify} from "@bunt/util";
import {TypeAbstract} from "../TypeAbstract";

export type UnionSelector = (input: unknown) => TypeAbstract<unknown> | undefined;

export class Union<TValue> extends TypeAbstract<TValue> {
    readonly #selector: UnionSelector;
    readonly #name: string;

    constructor(selector: UnionSelector, name = "Union") {
        super();
        this.#selector = selector;
        this.#name = name;
    }

    public get name(): string {
        return this.#name;
    }

    public validate(input: unknown): Promisify<TValue> {
        const type = this.#selector(input);
        this.assert(!!type, `${this.name} detection was failed`, input);

        return type.validate(input) as Promisify<TValue>;
    }
}
