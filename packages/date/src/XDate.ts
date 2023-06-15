import {assert} from "@bunt/assert";
import {XDateMutation} from "./XDateMutation.js";
import {XDateIntervalKind} from "./interface.js";

export class XDate {
    readonly #date: Date;

    constructor(date: string | number | Date = new Date()) {
        this.#date = new Date(date);
        assert(this.#date.getTime() > 0);
    }

    public get date(): Date {
        return new Date(this.#date);
    }

    public static from(date: string | number | Date = new Date()): XDate {
        return new this(date);
    }

    public getTime(): number {
        return this.#date.getTime();
    }

    public getDate(): Date {
        return this.date;
    }

    public toString(): string {
        return this.date.toString();
    }

    public begins(kind: Exclude<XDateIntervalKind, "ms">): XDate {
        return new XDate(XDateMutation.begins(kind, this.getTime()));
    }

    public ends(kind: Exclude<XDateIntervalKind, "ms">): XDate {
        return new XDate(XDateMutation.ends(kind, this.getTime()));
    }

    public mutate(...mutations: [XDateIntervalKind, number][]): XDate {
        return new XDate(XDateMutation.mutate(this.getTime(), ...mutations));
    }

    public set(...intervals: [XDateIntervalKind, number][]): XDate {
        return new XDate(XDateMutation.set(this.getTime(), ...intervals));
    }
}

/**
 * @deprecated
 */
export const DateTime = XDate;
