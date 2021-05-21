import {MayNullable, Promisify} from "@bunt/util";
import {assert} from "./Assertion";
import {MayInput} from "./interfaces";

export abstract class TypeAbstract<TValue, TInput extends MayInput = MayInput> {
    public get name(): string {
        return this.constructor.name;
    }

    public abstract validate(input: MayNullable<TInput>): Promisify<TValue>;

    public assert(expr: unknown, message: string, payload: unknown): asserts expr {
        assert(expr, this, message, payload);
    }
}
