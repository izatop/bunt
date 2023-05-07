import {assert} from "../assert.js";
import {DateTimeMutation} from "./DateTimeMutation.js";
import {DateTimeKind} from "./interface.js";

export class DateTime {
    readonly #date: Date;

    constructor(date: string | number | Date = new Date()) {
        this.#date = new Date(date);
        assert(this.#date.getTime() > 0);
    }

    public get date(): Date {
        return new Date(this.#date);
    }

    public static from(date: string | number | Date = new Date()): DateTime {
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

    public begins(kind: Exclude<DateTimeKind, "ms">): DateTime {
        return new DateTime(DateTimeMutation.begins(kind, this.getTime()));
    }

    public ends(kind: Exclude<DateTimeKind, "ms">): DateTime {
        return new DateTime(DateTimeMutation.ends(kind, this.getTime()));
    }

    public mutate(...mutations: [DateTimeKind, number][]): DateTime {
        return new DateTime(DateTimeMutation.mutate(this.getTime(), ...mutations));
    }

    public set(...intervals: [DateTimeKind, number][]): DateTime {
        return new DateTime(DateTimeMutation.set(this.getTime(), ...intervals));
    }
}
