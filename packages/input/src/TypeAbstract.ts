import {Promisify} from "@bunt/type";
import {assert} from "./Assertion/index.js";

export abstract class TypeAbstract<TValue> {
    public get name(): string {
        return this.constructor.name;
    }

    public abstract validate(input: unknown): Promisify<TValue>;

    public assert(expr: unknown, message: string, payload: unknown): asserts expr {
        assert(expr, this, message, payload);
    }
}
