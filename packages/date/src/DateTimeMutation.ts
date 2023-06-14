import {isFunction} from "@bunt/is";
import {assert} from "@bunt/assert";
import {DateTimeKind, TimeMutateFn} from "./interface.js";
import begins from "./mutators/begins.js";
import ends from "./mutators/ends.js";
import mutators from "./mutators/mutators.js";
import setters from "./mutators/setters.js";

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
