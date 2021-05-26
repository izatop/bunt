import {Fields, List, Union} from "./Type";
import {TypeAbstract} from "./TypeAbstract";

export type FieldFn<T> = () => T;
export type FieldType<T> = T | FieldFn<T>;

export type FieldsSchema<T> = {
    [K in keyof T]-?: T[K] extends Array<infer S>
        ? FieldType<List<S>>
        : T[K] extends Date
            ? FieldType<TypeAbstract<T[K]>>
            : T[K] extends Record<any, any>
                ? FieldType<Fields<T[K]> | Union<T[K]>>
                : FieldType<TypeAbstract<T[K]>>;
};

export type ObjectFields<T> = T extends Promise<infer A>
    ? FieldsSchema<Exclude<A, undefined | null>>
    : FieldsSchema<Exclude<T, undefined | null>>;

export type FieldSelectType<T> = FieldType<TypeAbstract<T>>;

export type ObjectTypeMerge<T extends Record<string, any>> = Fields<T> | ObjectFields<T>;
