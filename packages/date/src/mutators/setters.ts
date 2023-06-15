import {XDateIntervalKind, XTimeMutateFn} from "../interface.js";

const hour: XTimeMutateFn = (time, value) => new Date(time).setHours(value);
const day: XTimeMutateFn = (time, value) => new Date(time).setDate(value);
const week: XTimeMutateFn = (time, value) => new Date(time).setDate(value);
const month: XTimeMutateFn = (time, value) => new Date(time).setDate(value);
const year: XTimeMutateFn = (time, value) => new Date(time).setFullYear(value);

export default new Map<XDateIntervalKind, XTimeMutateFn>([
    ["ms", (time: number, value: number): number => new Date(time).setMilliseconds(value)],
    ["sec", (time: number, value: number): number => new Date(time).setSeconds(value)],
    ["min", (time: number, value: number): number => new Date(time).setMinutes(value)],
    ["hour", hour],
    ["day", day],
    ["week", week],
    ["month", month],
    ["year", year],
]);
