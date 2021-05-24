import {isFunction, Promisify} from "@bunt/util";
import {DisposableType} from "../Runtime";
import {Disposable} from "./Disposable";

export function dispose(disposable: DisposableType): Promisify<void> {
    if (isFunction(disposable)) {
        return disposable();
    }

    return Disposable.dispose(disposable);
}
