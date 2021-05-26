import {isFunction} from "@bunt/util";
import {FieldSelectType} from "./interfaces";
import {TypeAbstract} from "./TypeAbstract";

export async function validate<T>(type: FieldSelectType<T>, value: unknown): Promise<T> {
    if (isFunction(type)) {
        return type().validate(value);
    }

    return (type as TypeAbstract<T>).validate(value);
}
