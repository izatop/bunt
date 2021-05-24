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
        const disposer = collection.get(target);
        if (!disposer) {
            const finish = target.dispose;
            const newDisposer = new Disposer(target.constructor.name, () => finish.call(target));
            Reflect.defineProperty(target, "dispose", {
                value: function () {
                    return newDisposer.dispose();
                },
            });

            collection.set(target, newDisposer);
            return newDisposer;
        }

        return disposer;
    }
}
