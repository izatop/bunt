import {QueryString} from "../../../src";

describe("QueryString", () => {
    test("Base", () => {
        const field = "foo[bar][baz][0]";
        const parsed = QueryString.parseFieldName(field);

        expect(parsed)
            .toEqual(["foo", "bar", "baz", "0"]);

        expect(QueryString.inject(parsed, 1))
            .toEqual({foo: {bar: {baz: [1]}}});
    });

    test("Array", () => {
        const map: [string, any][] = [
            ["foo[0]", 1],
            ["foo[1]", 2],
            ["foo[2]", 3],
        ];

        const result = {};
        for (const [field, value] of map) {
            const paths = QueryString.parseFieldName(field);
            QueryString.inject(paths, value, result);
        }

        expect(result).toEqual({foo: [1, 2, 3]});
    });

    test("Nested array", () => {
        const map: [string, any][] = [
            ["foo[0][a]", 1],
            ["foo[0][b]", 2],
            ["foo[1][c]", 3],
            ["foo[1][d]", 4],
        ];

        const result = {};
        for (const [field, value] of map) {
            const paths = QueryString.parseFieldName(field);
            QueryString.inject(paths, value, result);
        }

        expect(result).toEqual({foo: [{a: 1, b: 2}, {c: 3, d: 4}]});
    });

    test.each([
        ["foo", 1, {foo: 1}],
        ["foo[bar]", 1, {foo: {bar: 1}}],
        ["foo[bar][0]", 1, {foo: {bar: [1]}}],
        ["foo[0][bar]", 1, {foo: [{bar: 1}]}],
    ])("Variants", (field, value, res) => (
        expect(QueryString.inject(QueryString.parseFieldName(field), value))
            .toEqual(res)
    ));
});
