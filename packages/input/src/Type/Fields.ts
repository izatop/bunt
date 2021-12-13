import {entriesReverse, isFunction, isInstanceOf, isObject, toError} from "@bunt/util";
import {AssertionObjectError, AssertionTypeError, IReadableTypeError} from "../Assertion";
import {ObjectFields, ObjectTypeMerge} from "../interfaces";
import {TypeAbstract} from "../TypeAbstract";

export class Fields<TValue extends Record<string, any>> extends TypeAbstract<TValue> {
    readonly #fields: ObjectFields<TValue>;
    readonly #name: string;

    constructor(fields: ObjectFields<TValue>, name = "Object") {
        super();
        this.#fields = fields;
        this.#name = name;
    }

    public get name(): string {
        return this.#name;
    }

    public get fields(): ObjectFields<TValue> {
        return this.#fields;
    }

    public merge<F extends Record<string, any>>(from: ObjectTypeMerge<F>): Fields<TValue & F> {
        if (isInstanceOf(from, Fields)) {
            return new Fields<TValue & F>(
                Object.assign({}, this.fields, from.fields) as any,
            );
        }

        return new Fields<TValue & F>(
            Object.assign({}, this.fields, from) as any,
        );
    }

    public async validate(payload: unknown): Promise<TValue> {
        this.assert(isObject(payload), `Wrong payload: ${this.name} expected`, payload);

        const entries: [string, any][] = [];
        const validations = new Map<string, IReadableTypeError>();
        for (const [field, type] of Object.entries(this.#fields)) {
            try {
                const validationType = isFunction(type) ? type() : type;
                this.assert(
                    isInstanceOf(validationType, TypeAbstract),
                    `Wrong field: ${field}`,
                    payload[field],
                );

                entries.push([field, await validationType.validate(payload[field])]);
            } catch (error) {
                if (isInstanceOf(error, AssertionTypeError)) {
                    validations.set(field, error.toSafeJSON());
                    continue;
                }

                validations.set(field, {
                    payload: payload[field],
                    message: toError(error, "Unknown").message,
                    type: "Unknown",
                });
            }
        }

        if (validations.size > 0) {
            throw new AssertionObjectError(
                "Assertion failed",
                this,
                payload,
                entriesReverse([...validations.entries()]),
            );
        }

        return entriesReverse(entries);
    }
}
