import {isInstanceOf, isObject} from "@bunt/util";
import {IServiceResolver} from "../interfaces.js";
import {Service} from "./Service.js";

export function isService<T>(maybe: unknown): maybe is IServiceResolver<T> {
    if (!isObject(maybe)) {
        return false;
    }

    return isInstanceOf(maybe, Service);
}

export const resolve: PropertyDecorator = (p, k) => {
    Service.resolve()(p, k);
};
