import {Logger} from "@bunt/util";
import {IServiceResolver} from "../interfaces.js";
import {IDisposable, isDisposable} from "../Runtime/index.js";
import {isService, Service} from "../Service/index.js";
import {ApplyContext, ResolveService} from "./interfaces.js";

const cache = new WeakMap();
const services = new WeakMap();

export class Context implements IDisposable {
    public static logger = Logger.factory(Context);
    public static disposables = new Set<IDisposable>();

    public static async resolve<T extends IServiceResolver<any>>(value: T): Promise<ResolveService<T>> {
        if (isService(value)) {
            const resolved = services.get(value) ?? value.resolve();
            if (!services.has(value)) {
                services.set(value, resolved);
            }

            return resolved;
        }

        return value;
    }

    public static async apply<C extends Context>(context: C): Promise<ApplyContext<C>> {
        const solved = cache.get(context) || await this.getResolvedContext(context);
        if (!cache.has(context)) {
            cache.set(context, solved);
        }

        return solved;
    }

    protected static async getResolvedContext<C extends Context>(context: C): Promise<ApplyContext<C>> {
        const name = context.constructor.name;
        const finish = this.logger.perf("Resolve context", {context: name});
        try {
            const descriptionMap: PropertyDescriptorMap = Object.getOwnPropertyDescriptors(context);
            for (const key of Service.getReferences(context, Context)) {
                if (Reflect.has(context, key)) {
                    const service = Reflect.get(context, key) as Service<any>;
                    const finishResolve = this.logger.perf(
                        "Resolve service",
                        {key, context: name, service: service.constructor.name},
                    );

                    try {
                        const value = await this.resolve(service);
                        Reflect.set(descriptionMap, key, {
                            enumerable: true,
                            writable: false,
                            configurable: false,
                            value,
                        });

                        if (isDisposable(value)) {
                            this.disposables.add(value);
                        }
                    } finally {
                        finishResolve();
                    }
                }
            }

            return Object.create(Object.getPrototypeOf(context), descriptionMap);
        } finally {
            finish();
        }
    }

    public dispose(): Promise<void> {
        return Promise.resolve(undefined);
    }
}
