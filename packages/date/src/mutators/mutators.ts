import {XDateIntervalKind, XTimeMultiply, XTimeMutateFn} from "../interface.js";

const hour: XTimeMutateFn = (time, value) => time + (value * XTimeMultiply.HOUR);
const day: XTimeMutateFn = (time, value) => time + (value * XTimeMultiply.DAY);

const week: XTimeMutateFn = (time, value) => {
    const date = new Date(time);

    return date.setDate(date.getDate() + (value * 7));
};

const month: XTimeMutateFn = (time, value) => {
    const date = new Date(time);

    return date.setMonth(date.getMonth() + value);
};

const year: XTimeMutateFn = (time, value) => {
    const date = new Date(time);

    return date.setFullYear(date.getFullYear() + value);
};

export default new Map<XDateIntervalKind, XTimeMutateFn>([
    ["ms", (time: number, value: number): number => time + value],
    ["sec", (time: number, value: number): number => time + (value * XTimeMultiply.SEC)],
    ["min", (time: number, value: number): number => time + (value * XTimeMultiply.MIN)],
    ["hour", hour],
    ["day", day],
    ["week", week],
    ["month", month],
    ["year", year],
]);
