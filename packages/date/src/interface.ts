export type XDateIntervalKind =
    "ms"
    | "sec"
    | "min"
    | "hour"
    | "day"
    | "month"
    | "week"
    | "year";

export type XTimeMutateFn = (date: number, value: number) => number;

export enum XTimeMultiply {
    SEC = 1000,
    MIN = SEC * 60,
    HOUR = MIN * 60,
    DAY = HOUR * 24,
}

export type XDateConfig = {
    locale: string;
    timeZone: string;
    weekBegins: number;
};
