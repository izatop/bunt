const sec = (time: number): number => new Date(time).setMilliseconds(999);
const min = (time: number): number => new Date(time).setSeconds(59, 999);
const hour = (time: number): number => new Date(time).setMinutes(59, 59, 999);
const day = (time: number): number => new Date(time).setHours(23, 59, 59, 999);

const week = (time: number): number => {
    const date = new Date(time);

    return day(date.setDate(date.getDate() - date.getDay() + 6));
};

const month = (time: number): number => {
    const date = new Date(time);

    return day(date.setDate(new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()));
};

const year = (time: number): number => {
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
