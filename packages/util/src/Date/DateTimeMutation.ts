import {assert} from "../assert";
import {isFunction} from "../is";
import {DateTimeKind, TimeMutateFn} from "./interface";
import begins from "./mutators/begins";
import ends from "./mutators/ends";
import mutators from "./mutators/mutators";
import setters from "./mutators/setters";

export class DateTimeMutation {
    public static begins(kind: Exclude<DateTimeKind, "ms">, time: number): number {
        assert(kind in begins);
        return begins[kind](time);
    }

    public static ends(kind: Exclude<DateTimeKind, "ms">, time: number): number {
        assert(kind in begins);
        return ends[kind](time);
    }

    public static set(time: number, ...intervals: [DateTimeKind, number][]): number {
        return this.apply(setters, time, intervals);
    }

    public static mutate(time: number, ...mutations: [DateTimeKind, number][]): number {
        return this.apply(mutators, time, mutations);
    }

    protected static apply(map: Map<DateTimeKind, TimeMutateFn>,
        time: number,
        values: [DateTimeKind, number][]): number {
        for (const [interval, value] of values) {
            const fn = map.get(interval);
            assert(isFunction(fn));
            time = fn(time, value);
        }

        return time;
    }
}
