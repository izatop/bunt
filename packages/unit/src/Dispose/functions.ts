import {all, isFunction, toError} from "@bunt/util";
import {DisposableType, isRunnable, SystemLogger} from "../Runtime";

export async function dispose(disposable: DisposableType): Promise<void> {
    const {constructor: {name}} = disposable;
    const perf = SystemLogger.perf("disposed %s", name);
    try {
        if (isFunction(disposable)) {
            SystemLogger.debug("dispose %s()", name);
            return Promise.resolve(disposable());
        }

        if (isRunnable(disposable)) {
            SystemLogger.debug("destroy %s().getHeartbeat()", name);
            disposable
                .getHeartbeat()
                .destroy();
        }

        SystemLogger.debug("%s.dispose()", name);
        await disposable.dispose();
    } catch (error) {
        SystemLogger.error(toError(error, "Unexpected error").message, error);
    } finally {
        perf();
    }
}

export async function disposeAll(disposables: DisposableType[]) {
    const ops: Promise<void>[] = [];
    for(const disposable of disposables) {
        ops.push(Promise.resolve(dispose(disposable)));
    }

    await all(ops);
}

