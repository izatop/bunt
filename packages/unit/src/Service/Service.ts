import {Ctor, DecoratorTarget} from "@bunt/util";
import {IServiceResolver} from "../interfaces.js";
import {ServiceRef} from "./ServiceRef.js";

export abstract class Service<T> implements IServiceResolver<T> {
    public static getReferences(target: unknown, base: Ctor | null = null): PropertyKey[] {
        const references = [];
        for (const proto of this.getPrototypes(target, base)) {
            references.push(...ServiceRef.get(proto));
        }

        return references;
    }

    public static resolve(): PropertyDecorator {
        const fn = (target: DecoratorTarget, key: PropertyKey): void => {
            ServiceRef.set(target, key);
        };

        return fn as PropertyDecorator;
    }

    protected static* getPrototypes(target: unknown, base: Ctor | null = null): Generator<any> {
        let proto = Object.getPrototypeOf(target);
        const baseProto = base === null ? null : base.prototype;
        while (baseProto !== proto) {
            yield proto;
            proto = Object.getPrototypeOf(proto);
        }
    }

    public abstract resolve(): Promise<T>;
}
