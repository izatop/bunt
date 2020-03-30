import {performance} from "perf_hooks";
import {isString} from "../is";
import {ILogable} from "../Logger";
import {IPerfValue, PerfLabel} from "./interfaces";

export class Perf implements ILogable<IPerfValue> {
    public readonly label: string;
    public readonly start = performance.now();

    #finish = 0;

    constructor(...labels: PerfLabel[]) {
        this.label = labels.map((label) => isString(label) ? label : label.constructor.name)
            .join(" -> ");
    }

    public get time() {
        return this.#finish > 0 ? this.#finish - this.start : -1;
    }

    public static make(label: string | object) {
        return new Perf(label);
    }

    public finish() {
        this.#finish = performance.now();
        return this;
    }

    public getLogValue(): IPerfValue {
        return {
            label: this.label,
            start: this.start,
            finish: this.#finish,
            time: this.time,
        };
    }
}
