import {XDate, XDateIntervalKind} from "../../src";

describe("DateTime", () => {
    const date = new XDate("2020-02-12T12:35:13.123Z");
    test("mutate()", () => {
        const mutations: [XDateIntervalKind, number][] = [
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
        const setters: [XDateIntervalKind, number][] = [
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
        const begins: Exclude<XDateIntervalKind, "ms">[] = ["sec", "min", "hour", "day", "month", "year"];
        for (const kind of begins) {
            result.push({
                kind,
                begins: date.begins(kind).getDate(),
                ends: date.ends(kind).getDate(),
            });
        }

        expect(result).toMatchSnapshot();
    });

    const tests: [number, XDate][] = new Array(7)
        .fill(new Date(2024, 8, 1))
        .map((d: Date, index) => new XDate(d).mutate(["day", index]).date)
        .map((d: Date) => [d.getDate(), new XDate(d)]);

    test.each(tests)("begins/ends ( %d )", (...args) => {
        const dt = args.pop() as XDate;
        expect(dt.begins("week").date.getDate()).toBe(1);
        expect(dt.ends("week").date.getDate()).toBe(7);
    });
});
