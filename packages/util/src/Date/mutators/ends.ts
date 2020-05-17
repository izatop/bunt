import {getWeekBegins} from "../Locale";

const weekBegins = getWeekBegins();

const sec = (time: number) => new Date(time).setMilliseconds(999);
const min = (time: number) => new Date(time).setSeconds(59, 999);
const hour = (time: number) => new Date(time).setMinutes(59, 59, 999);
const day = (time: number) => new Date(time).setHours(23, 59, 59, 999);

const week = (time: number) => {
    const date = new Date(time);
    const weekDay = date.getDay() - weekBegins < 0 ? 7 - weekBegins : date.getDay() - weekBegins;
    return day(date.setDate(date.getDate() - weekDay + 7 - weekBegins));
};

const month = (time: number) => {
    const date = new Date(time);
    return day(date.setDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
};

const year = (time: number) => {
    const date = new Date(time);
    return month(date.setMonth(11));
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
