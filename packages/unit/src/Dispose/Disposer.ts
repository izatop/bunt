import {AsyncState, Logger, logger} from "@bunt/util";
import {DisposableFn, DisposableType, IDisposedHistory} from "../Runtime";
import {dispose} from "./functions";

export class Disposer {
    @logger
    protected readonly logger!: Logger;

    readonly #disposable: DisposableType[] = [];
    readonly #disposeHistory: IDisposedHistory[] = [];

    #state?: Promise<void>;
    readonly #label: string;

    constructor(label: string, finish: DisposableFn) {
        this.logger.setLabel(`Disposer(${label})`);
        this.#label = label;
        this.#disposable.push(finish);
    }

    public get label(): string {
        return this.#label;
    }

    public get disposed(): boolean {
        return !!this.#state;
    }

    public get history(): IDisposedHistory[] {
        return this.#disposeHistory;
    }

    public attach(disposable: DisposableType): void {
        this.logger.debug("add", {label: this.label, target: disposable?.constructor?.name ?? "Unknown"});

        if (this.disposed) {
            dispose(disposable);
            return;
        }

        this.#disposable.push(disposable);
    }

    public dispose(): Promise<void> {
        if (this.#state) {
            return this.#state;
        }

        this.logger.debug("dispose", this.label);
        this.#state = AsyncState.acquire<void>();
        return this.disposeAll();
    }

    private async disposeAll() {
        while (this.#disposable.length > 0) {
            for (const disposable of this.#disposable.splice(0).reverse()) {
                const date = new Date();
                const target = disposable?.constructor?.name ?? "Unknown";
                const {label} = this;

                try {
                    await dispose(disposable);
                    this.logger.debug("dispose", {label, target, date, timeout: Date.now() - date.getTime()});
                    this.#disposeHistory.push({label, target, date, timeout: Date.now() - date.getTime()});
                } catch (error) {
                    this.logger.warning("dispose", {target, error, date, timeout: Date.now() - date.getTime()});
                    this.#disposeHistory.push({label, target, error, date, timeout: Date.now() - date.getTime()});
                }
            }
        }

        AsyncState.resolve(this.#state);
    }
}
