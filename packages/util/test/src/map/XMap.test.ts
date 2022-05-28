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

    test("pick", () => {
        const map = new XMap<number, number>();
        map.set(1, 2);
        map.set(2, 3);
        expect(map.pick(1)).toBe(2);
        expect([...map.entries()]).toEqual([[2, 3]]);
    });

    test("fromArray", () => {
        const map = XMap.fromArray([1, 2, 3], (_, index) => index);
        expect([...map.entries()]).toEqual([[0, 1], [1, 2], [2, 3]]);
    });

    test("fromObject", () => {
        const map = XMap.fromObject({foo: 1, bar: 2});
        expect([...map.entries()]).toEqual([["foo", 1], ["bar", 2]]);
    });
});
