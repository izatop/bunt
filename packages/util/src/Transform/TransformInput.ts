import {Promisify} from "../interfaces";
import {isArray, isFunction, isObject} from "../is";
import {JSONInput, Transformable, TransformOut, TransformSchema} from "./interfaces";

export class TransformInput {
    public static transform<T extends Transformable>(data: JSONInput<T>,
        scheme: TransformSchema<T>): Promise<TransformOut<T>>;

    public static async transform<T extends Transformable>(data: JSONInput<T>,
        schema: TransformSchema<T>): Promise<TransformOut<T>> {
        if (isArray(data)) {
            return Promise.all(data.map((item: any) => this.transform<T>(item, schema))) as any;
        }

        for (const [property, transform] of Object.entries(schema)) {
            if (!Reflect.has(data, property)) {
                continue;
            }

            const sourceValue = Reflect.get(data, property);
            if (isFunction(transform)) {
                Reflect.set(data, property, await transform(sourceValue));
                continue;
            }

            if (isObject(transform)) {
                await this.transform(sourceValue, transform);
            }
        }

        return data as TransformOut<T>;
    }

    public static create<T extends Transformable>(schema: TransformSchema<T>) {
        return async (data: Promisify<JSONInput<T>>): Promise<TransformOut<T>> => {
            return this.transform(await data, schema);
        };
    }
}
