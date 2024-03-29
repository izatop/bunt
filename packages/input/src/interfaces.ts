import {KeyOf} from "@bunt/type";
import {Fields, Int, Nullable} from "./Type/index.js";
import {TypeAbstract} from "./TypeAbstract.js";

export type FieldMayFn<T> = T | (() => T);

export type FieldsSchema<T extends Record<string, any>> = {
    [K in KeyOf<T>]-?: FieldSelectType<T[K]>;
};

export type FieldSelectType<T> = FieldMayFn<TypeAbstract<T>>;

type Foo = {foo?: number; bar: number};
new Fields<Foo>({foo: Int, bar: Int});
new Fields<Foo>({foo: new Nullable(Int), bar: Int});
