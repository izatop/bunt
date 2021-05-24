import {assert, AsyncState, Logger, logger} from "@bunt/util";
import {DisposableFn, DisposableType, IDisposedHistory} from "../Runtime";
import {dispose} from "./functions";

export class Disposer {
    @logger
    protected readonly logger!: Logger;

    readonly #disposable: DisposableType[] = [];
    readonly #disposeHistory: IDisposedHistory[] = [];
    readonly #finish: DisposableFn;

    #state?: Promise<void>;

    constructor(label: string, finish: DisposableFn) {
        this.logger.setLabel(`Disposer(${label})`);
        this.#finish = finish;
    }

    public get disposed(): boolean {
        return !!this.#state;
    }

    public get history(): IDisposedHistory[] {
        return this.#disposeHistory;
    }

    public attach(disposable: DisposableType): void {
        assert(!this.disposed, "Disposer is in disposed state");

        this.#disposable.push(disposable);
    }

    public async dispose(): Promise<void> {
        if (this.#state) {
            return this.#state;
        }

        this.#state = AsyncState.acquire<void>();
        for (const disposable of [...this.#disposable.splice(0), this.#finish]) {
            const date = new Date();
            const target = disposable?.constructor?.name ?? "Unknown";

            try {
                await dispose(disposable);
                this.logger.debug("dispose", {target, date, timeout: Date.now() - date.getTime()});
                this.#disposeHistory.push({target, date, timeout: Date.now() - date.getTime()});
            } catch (error) {
                this.logger.warning("dispose", {target, error, date, timeout: Date.now() - date.getTime()});
                this.#disposeHistory.push({target, error, date, timeout: Date.now() - date.getTime()});
            }
        }

        AsyncState.resolve(this.#state);
    }
}
