import {DateTime, DateTimeKind} from "../../src";

describe("DateTime", () => {
    const date = new DateTime("2020-02-12T12:35:13.123Z");
    test("mutate()", () => {
        const mutations: [DateTimeKind, number][] = [
            ["ms", +100],
            ["sec", +10],
            ["min", -10],
            ["week", -1],
            ["week", +2],
            ["month", +3],
            ["hour", +2],
            ["day", -1],
            ["year", -5],
        ];

        const result = [];
        for (const [type, value] of mutations) {
            result.push([type, value, date.mutate([type, value]).getDate()]);
        }

        expect(result).toMatchSnapshot();
    });

    test("set()", () => {
        const setters: [DateTimeKind, number][] = [
            ["ms", 333],
            ["sec", 22],
            ["min", 11],
            ["hour", 0],
            ["month", 2],
            ["day", 11],
            ["year", 2022],
        ];

        const result = [];
        for (const [type, value] of setters) {
            result.push([type, value, date.set([type, value]).getDate()]);
        }

        expect(result).toMatchSnapshot();
    });

    test("begins/ends()", () => {
        const result = [];
        const begins: Exclude<DateTimeKind, "ms">[] = ["sec", "min", "hour", "day", "month", "year"];
        for (const kind of begins) {
            result.push({
                kind,
                begins: date.begins(kind).getDate(),
                ends: date.ends(kind).getDate(),
            });
        }

        expect(result).toMatchSnapshot();
    });

    const tests: [number, DateTime][] = new Array(7)
        .fill(new Date(2020, 4, 11))
        .map((d: Date, index) => new DateTime(d).mutate(["day", index]).date)
        .map((d: Date) => [d.getDate(), new DateTime(d)]);
    test.each(tests)("begins/ends ( %d )", (...args) => {
        const dt = args.pop() as DateTime;
        expect(dt.begins("week").date.getDate()).toBe(11);
        expect(dt.ends("week").date.getDate()).toBe(17);
    });
});
