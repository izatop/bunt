import {MaybeArray, MayNullable} from "@bunt/util";
import {Fields, List} from "./Type";
import {TypeAbstract} from "./TypeAbstract";

export type Scalars = string | number | boolean;

export interface Compound {
    [key: string]: MaybeArray<Scalars | Compound>;
}

export type MayInput = MayNullable<MaybeArray<MayNullable<Scalars | Compound>>>;
export type MayListInput = MayNullable<Scalars | Compound>;

export type FieldFn<T> = () => T;
export type FieldType<T> = T | FieldFn<T>;

export type FieldsSchema<T> = {
    [K in keyof T]-?: T[K] extends Array<infer S>
        ? FieldType<List<S, any>>
        : T[K] extends Record<any, any>
            ? FieldType<Fields<T[K]>>
            : FieldType<TypeAbstract<T[K], any>>;
};

export type ObjectFields<T> = T extends Promise<infer A>
    ? FieldsSchema<Exclude<A, undefined | null>>
    : FieldsSchema<Exclude<T, undefined | null>>;

export type FieldSelectType<T> = T extends Record<string, any>
    ? FieldType<Fields<T>>
    : T extends Array<infer I>
        ? FieldType<List<I, any>>
        : FieldType<TypeAbstract<T, any>>;

export type ObjectTypeMerge<T extends Record<string, any>> = Fields<T> | ObjectFields<T>;
