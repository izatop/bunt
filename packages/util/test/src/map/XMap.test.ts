import {XMap} from "../../../src";

describe("XMap", () => {
    test("constructor initializer", () => {
        const map = new XMap<number, string[]>(() => []);
        expect(map.get(1)).toBeUndefined();
        expect(map.ensure(1)).toEqual([]);
        map.ensure(1).push("foo");

        expect(map.ensure(1)).toEqual(["foo"]);
    });

    test("ensure initializer", () => {
        const map = new XMap<number, Record<string, number>>();
        expect(() => map.ensure(1)).toThrowError();
    });

    test("ensure nullable", () => {
        const map = new XMap<number, any>();
        expect(() => map.ensure(1, () => undefined)).not.toThrowError();
        expect(() => map.ensure(2, () => false)).not.toThrowError();
        expect(() => map.ensure(3, () => null)).not.toThrowError();
    });
});
