import {DecoratorTarget} from "@bunt/type";

// eslint-disable-next-line @typescript-eslint/ban-types
const refs = new WeakMap<Function, ServiceRef>();

export class ServiceRef implements Iterable<PropertyKey> {
    protected readonly target: DecoratorTarget;
    protected readonly properties = new Set<PropertyKey>();

    constructor(target: DecoratorTarget) {
        this.target = target;
    }

    public static set(target: DecoratorTarget, property: PropertyKey): void {
        this.get(target).add(property);
    }

    public static get(target: DecoratorTarget): ServiceRef {
        const ref = refs.get(target.constructor) || new ServiceRef(target);
        if (!refs.has(target.constructor)) {
            refs.set(target.constructor, ref);
        }

        return ref;
    }

    public static getProperties(target: DecoratorTarget): (PropertyKey)[] {
        return [
            ...this.get(target)
                .properties.values(),
        ];
    }

    public add(key: PropertyKey): void {
        this.properties.add(key);
    }

    [Symbol.iterator](): Iterator<PropertyKey> {
        return this.properties.values();
    }
}
