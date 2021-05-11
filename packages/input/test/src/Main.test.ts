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
    DateTime,
} from "../../src";
import {AssertionObjectError} from "../../src/Assertion";
import {JSONString} from "../../src/Type/JSONString";
import {ITestDescription, ITestHobby, ITestType} from "./interfaces";

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
        [`{"foo": "bar"}`, {foo: "bar"}, JSONString],
        ["true", true, JSONString],
        ["1", 1, JSONString],
        ["[1]", [1], JSONString],
    ];

    test.each(samples)(
        "Test %s -> %s",
        async (payload, expected, type) => {
            await expect(validate(type, payload)).resolves.toEqual(expected);
        },
    );

    test("AssertionError", async () => {
        const Description = new Fields<ITestDescription>({
            author: Text,
            date: DateTime,
            text: Text,
        });

        const Hobby = new Fields<ITestHobby>({
            type: Text,
            description: new Nullable(Description),
        });

        const human: Fields<ITestType> = new Fields<ITestType>({
            age: Int,
            name: Text,
            children: () => new NonNull(new List(human), []),
            parent: () => new Nullable(human),
            links: () => new List(Text),
            hobby: new Nullable(Hobby),
        }, "Human");

        const payload = {
            age: 32,
            parent: {name: "Parent", links: ["a"]},
            children: [
                {name: "Lisa", age: 8, links: ["b"]},
                {age: 12, name: "Bob", children: 1},
                {age: 3},
            ],
            links: ["a", "c"],
        };

        const pending = validate(human, payload);
        await expect(pending).rejects.toThrow();
        const error = await pending.catch((error) => error);
        expect(error).toBeInstanceOf(AssertionObjectError);
        if (isInstanceOf(error, AssertionObjectError)) {
            expect(error.getLogValue()).toMatchSnapshot();
        }
    });

    test("JSON parse fails", () => {
        expect(validate(JSONString, undefined))
            .rejects
            .toThrow();

        expect(validate(JSONString, "{123r1]"))
            .rejects
            .toThrow();
    });
});
