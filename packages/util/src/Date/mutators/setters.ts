import {DateTimeKind, TimeMutateFn} from "../interface.js";

const hour: TimeMutateFn = (time, value) => new Date(time).setHours(value);
const day: TimeMutateFn = (time, value) => new Date(time).setDate(value);
const week: TimeMutateFn = (time, value) => new Date(time).setDate(value);
const month: TimeMutateFn = (time, value) => new Date(time).setDate(value);
const year: TimeMutateFn = (time, value) => new Date(time).setFullYear(value);

export default new Map<DateTimeKind, TimeMutateFn>([
    ["ms", (time: number, value: number): number => new Date(time).setMilliseconds(value)],
    ["sec", (time: number, value: number): number => new Date(time).setSeconds(value)],
    ["min", (time: number, value: number): number => new Date(time).setMinutes(value)],
    ["hour", hour],
    ["day", day],
    ["week", week],
    ["month", month],
    ["year", year],
]);
