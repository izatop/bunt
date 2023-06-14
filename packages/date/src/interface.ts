export type DateTimeKind =
    "ms"
    | "sec"
    | "min"
    | "hour"
    | "day"
    | "month"
    | "week"
    | "year";

export type TimeMutateFn = (date: number, value: number) => number;

export enum TimeMultiply {
    SEC = 1000,
    MIN = SEC * 60,
    HOUR = MIN * 60,
    DAY = HOUR * 24,
}

export type DateConfig = {
    locale: string;
    timeZone: string;
    weekBegins: number;
};
