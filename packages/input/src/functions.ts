import {isFunction} from "@bunt/is";
import {FieldSelectType} from "./interfaces.js";
import {TypeAbstract} from "./TypeAbstract.js";

export async function validate<T>(type: FieldSelectType<T>, value: unknown): Promise<T> {
    if (isFunction(type)) {
        return type().validate(value);
    }

    return (type as TypeAbstract<T>).validate(value);
}

export const entriesReverse = <V>(entries: [string | number | symbol, V][] = []): Record<any, any> => {
    return Object.assign({}, ...entries.map(([key, value]) => ({[key]: value})));
};
