import {SuperType} from "../SuperType.js";
import {TypeAbstract} from "../TypeAbstract.js";

export type MutateFunction<TIn, TOut> = (value: TIn) => TOut;

export class Mutate<TValue, SValue> extends SuperType<TValue, SValue> {
    readonly #mutate: MutateFunction<SValue, TValue>;
    constructor(type: TypeAbstract<SValue>, mutate: MutateFunction<SValue, TValue>) {
        super(type);
        this.#mutate = mutate;
    }

    public async validate(payload: unknown): Promise<TValue> {
        const value = await this.type.validate(payload);

        return this.#mutate(value);
    }
}
