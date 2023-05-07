import {getWeekBegins} from "../Locale.js";

const weekBegins = getWeekBegins();

const sec = (time: number): number => new Date(time).setMilliseconds(0);
const min = (time: number): number => new Date(time).setSeconds(0, 0);
const hour = (time: number): number => new Date(time).setMinutes(0, 0, 0);
const day = (time: number): number => new Date(time).setHours(0, 0, 0, 0);
const month = (time: number): number => day(new Date(time).setDate(0));
const year = (time: number): number => month(new Date(time).setMonth(0));
const week = (time: number): number => {
    const date = new Date(time);
    const weekDay = date.getDay() - weekBegins < 0 ? 7 - weekBegins : date.getDay() - weekBegins;

    return day(date.setDate(date.getDate() - weekDay));
};

export default {
    sec,
    min,
    hour,
    day,
    week,
    month,
    year,
};
