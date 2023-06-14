import {safeMap} from "@bunt/util";
import {isFunction} from "@bunt/is";
import {toError} from "@bunt/assert";
import {DisposableType, isRunnable, SystemLogger} from "../Runtime/index.js";

const disposed = new WeakSet<DisposableType>();

export async function dispose(disposable: DisposableType): Promise<void> {
    if (disposed.has(disposable)) {
        return;
    }

    disposed.add(disposable);

    const {constructor: {name}} = disposable;
    const perf = SystemLogger.perf("disposed %s", name);
    try {
        if (isFunction(disposable)) {
            SystemLogger.debug("dispose %s()", name);

            return Promise.resolve(disposable());
        }

        if (isRunnable(disposable)) {
            SystemLogger.debug("destroy %s().getHeartbeat()", name);
            const heartbeat = disposable.getHeartbeat();
            await dispose(heartbeat);
        }

        SystemLogger.debug("%s.dispose()", name);
        await disposable.dispose();
    } catch (error) {
        SystemLogger.error(toError(error, "Unexpected error").message, error);
    } finally {
        perf();
    }
}

export async function disposeAll(disposables: DisposableType[]): Promise<void> {
    await safeMap(disposables, (disposable) => dispose(disposable));
}

