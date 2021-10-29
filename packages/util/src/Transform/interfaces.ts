import {Promisify} from "../interfaces";

export type TypeToJSON<T> = T extends Date ? string | number : any;
export type TransformFunction<T> = (value: TypeToJSON<T>) => Promisify<T>;
export type TransformSchema<T> = T extends Array<infer E>
    ? TransformSchemaObject<E>
    : TransformSchemaObject<T>;

export type TransformSchemaObject<T> = {
    [K in keyof T]?: T[K] extends Array<infer S>
        ? S extends Record<any, any>
            ? TransformFunction<S> | TransformSchemaObject<S>
            : TransformFunction<S>
        : T[K] extends Record<any, any>
            ? TransformFunction<T[K]> | TransformSchemaObject<T[K]>
            : TransformFunction<T[K]>;
};

export type JSONInput<T> = T extends Array<infer E>
    ? JSONInput<E>[]
    : T extends Record<any, any>
        ? {
            [K in keyof T]: T[K] extends Array<infer S>
                ? Array<JSONInput<S>>
                : JSONInput<T[K]>;
        }
        : T extends Date
            ? string | number
            : any;

export type Transformable = Record<any, any> | Record<any, any>[];

export type TransformOut<T, S extends TransformSchema<T> = TransformSchema<T>> = T extends Array<infer E>
    ? {[K in keyof E]: K extends keyof S ? S[K] extends () => infer R ? R : E[K] : E[K]}[]
    : {[K in keyof T]: K extends keyof S ? S[K] extends () => infer R ? R : T[K] : T[K]};
