import {TransformInput} from "../../../src";

type TestEntry = {
    str: string;
    date: Date;
    obj: {
        date: Date;
        num: number;
    };
    arr: {f: number}[];
};

describe("Transform", () => {
    test("Array", async () => {
        const transform = TransformInput.create<{foo: number}[]>({
            foo: (v) => +v,
        });

        const data = [{foo: "1"}, {foo: "2"}];
        expect(await transform(data)).toEqual([{foo: 1}, {foo: 2}]);
    });

    test("Test", async () => {
        const transform = TransformInput.create<TestEntry>({
            date: (v) => new Date(v),
            obj: {
                date: (v) => new Date(v),
                num: (v) => +v,
            },
            arr: {
                f: (v: string) => +v,
            },
        });

        const data: any = {
            str: "foo",
            date: "2000-01-01T00:00:00.000Z",
            obj: {
                date: "2000-01-01T00:00:00.000Z",
                num: "123",
            },
            arr: [{f: "1"}],
        };

        expect(await transform(data)).toEqual({
            str: "foo",
            date: new Date("2000-01-01T00:00:00.000Z"),
            obj: {
                date: new Date("2000-01-01T00:00:00.000Z"),
                num: 123,
            },
            arr: [{f: 1}],
        });
    });

});
