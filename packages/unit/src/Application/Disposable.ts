import {DisposableType, IDisposable} from "../Runtime";
import {Disposer} from "./Disposer";

const collection = new Map<IDisposable, Disposer>();

export class Disposable {
    public static attach(target: IDisposable, disposable: DisposableType): void {
        const disposer = this.resolve(target);
        disposer.attach(disposable);
    }

    public static dispose(target: IDisposable): Promise<void> {
        const disposer = this.resolve(target);
        return disposer.dispose();
    }

    public static resolve(target: IDisposable): Disposer {
        const disposer = collection.get(target) ?? new Disposer(target.constructor.name);
        if (!collection.has(target)) {
            const dispose = target.dispose;
            disposer.attach(() => dispose.call(this));
            Reflect.defineProperty(target, "dispose", {
                value: function () {
                    return disposer.dispose();
                },
            });

            collection.set(target, disposer);
        }

        return disposer;
    }
}
