import {DisposableType, IDisposable, isRunnable} from "../Runtime";
import {Disposer} from "./Disposer";

const collection = new Map<IDisposable, Disposer>();

export class Disposable {
    public static attach(target: IDisposable, disposable: DisposableType): void {
        const disposer = this.resolve(target);
        disposer.attach(disposable);
    }

    public static dispose(target: IDisposable): Promise<void> {
        const disposer = this.resolve(target);

        const finish = (error?: Error) => {
            if (isRunnable(target)) {
                const heartbeat = target.getHeartbeat();
                heartbeat.destroy(error);
            }
        };

        return disposer.dispose()
            .then(() => finish())
            .catch((error) => finish(error))
            .finally(() => collection.delete(target));
    }

    public static async disposeAll(): Promise<void> {
        const pending: Promise<void>[] = [];
        for (const target of collection.keys()) {
            pending.push(this.dispose(target));
        }

        await Promise.allSettled(pending);
    }

    public static resolve(target: IDisposable): Disposer {
        const disposer = collection.get(target);
        if (!disposer) {
            const finish = target.dispose;
            const newDisposer = new Disposer(target.constructor.name, () => finish.call(target));
            collection.set(target, newDisposer);

            Reflect.defineProperty(target, "dispose", {
                value: () => newDisposer.dispose(),
            });

            return newDisposer;
        }

        return disposer;
    }
}
