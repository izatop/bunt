import {Logger, logger, safeMap} from "@bunt/util";
import {DisposableType, IDisposable} from "../Runtime";
import {dispose} from "./functions";

export abstract class Disposer implements IDisposable {
    @logger
    protected readonly logger!: Logger;

    readonly #disposables: DisposableType[] = [];

    public onDispose(disposable: DisposableType) {
        this.logger.debug("onDispose(%s)", disposable.constructor.name);
        this.#disposables.push(disposable);
    }

    public async dispose(): Promise<void> {
        this.logger.debug("dispose(%o)", this.#disposables.map(({constructor: {name}}) => name));
        await safeMap(this.#disposables, dispose);
    }
}
