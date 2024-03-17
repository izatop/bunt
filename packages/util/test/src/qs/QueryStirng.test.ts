import {QueryString} from "../../../src";

describe("QueryString", () => {
    test("Prevent pollution", () => {
        const injectTest = {};
        const injectKey = "__proto__[polluted]";

        const qs = new QueryString();
        qs.push(injectKey, true);

        expect(Reflect.has(Reflect.get(injectTest, "__proto__"), "polluted")).toBeFalsy();
    });

    test("Base", () => {
        const qs = new QueryString();
        const field = "foo[bar][baz][0]";
        const parsed = qs.parseField(field);

        expect(parsed)
            .toEqual(["foo", "bar", "baz", "0"]);

        expect(qs.push(field, 1))
            .toEqual({foo: {bar: {baz: [1]}}});
    });

    test("Array", () => {
        const qs = new QueryString();
        const map: [string, any][] = [
            ["foo[0]", 1],
            ["foo[1]", 2],
            ["foo[2]", 3],
        ];

        for (const [field, value] of map) {
            qs.push(field, value);
        }

        expect(qs.toObject()).toEqual({foo: [1, 2, 3]});
    });

    test("Nested array", () => {
        const qs = new QueryString();
        const map: [string, any][] = [
            ["foo[0][a]", 1],
            ["foo[0][b]", 2],
            ["foo[1][c]", 3],
            ["foo[1][d]", 4],
        ];

        for (const [field, value] of map) {
            qs.push(field, value);
        }

        expect(qs.toObject()).toEqual({foo: [{a: 1, b: 2}, {c: 3, d: 4}]});
    });

    test.each([
        ["foo", 1, {foo: 1}],
        ["foo[bar]", 1, {foo: {bar: 1}}],
        ["foo[bar][0]", 1, {foo: {bar: [1]}}],
        ["foo[0][bar]", 1, {foo: [{bar: 1}]}],
    ])("Variants", (field, value, res) => {
        const qs = new QueryString([[field, value]]);
        expect(qs.toObject()).toEqual(res);
    });
});
