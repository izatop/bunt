import {DateTime} from "@bunt/input";
import {isInstanceOf} from "@bunt/util";
import {
    Bool,
    Fields,
    Float,
    Int,
    List,
    NonNull,
    Nullable,
    Text,
    ToNumber,
    TypeAbstract,
    Union,
    validate,
    Varchar,
} from "../../src";
import {AssertionObjectError} from "../../src/Assertion";
import {ITestType} from "./interfaces";

describe("Test Input", () => {
    const rand = Math.random();
    const union = new Union<Date | boolean, string | number | boolean>(
        (input) => {
            switch (typeof input) {
                case "string":
                case "number":
                    return DateTime;
                case "boolean":
                    return Bool;
            }
        },
    );

    const samples: [any, any, TypeAbstract<any, any>][] = [
        [1, 1, Int],
        ["1", 1, new ToNumber(Int)],
        [false, false, Bool],
        [true, true, Bool],
        [rand, rand, Float],
        [null, undefined, new Nullable(Int)],
        [undefined, undefined, new Nullable(Int)],
        [null, "foo", new NonNull(Text, "foo")],
        [undefined, [1], new NonNull(new List(Int), [1])],
        ["text", "text", Text],
        ["text", "text", new Varchar({min: 0, max: 4})],
        [{v: 1, b: true, n: []}, {v: 1, b: true}, new Fields({v: Int, b: Bool})],
        [[1, 2, 3], [1, 2, 3], new List(Int)],
        [false, false, union],
        ["2020-01-01", new Date("2020-01-01"), union],
        [new Date("2020-01-01").getTime(), new Date("2020-01-01"), union],
    ];

    test.each(samples)(
        "Test %s -> %s",
        async (payload, expected, type) => {
            await expect(validate(type, payload)).resolves.toEqual(expected);
        },
    );

    test("AssertionError", async () => {
        const human: Fields<ITestType> = new Fields<ITestType>({
            age: Int,
            name: Text,
            children: () => new NonNull(new List(human), []),
            parent: () => new Nullable(human),
        }, "Human");

        const payload = {
            age: 32,
            parent: {name: "Parent"},
            children: [
                {name: "Lisa", age: 8},
                {age: 12, name: "Bob", children: 1},
                {age: 3},
            ],
        };

        const pending = validate(human, payload);
        await expect(pending).rejects.toThrow();
        const error = await pending.catch((error) => error);
        expect(error).toBeInstanceOf(AssertionObjectError);
        if (isInstanceOf(error, AssertionObjectError)) {
            expect(error.getLogValue()).toMatchSnapshot();
        }
    });
});
