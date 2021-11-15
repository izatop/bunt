import {Env} from "../../../src";

describe("Env", () => {
    test("get/ensure", () => {
        const env = Env.factory<{foo: string; baz?: string}>({foo: "bar", baz: undefined});

        expect(env.get("foo")).toBe("bar");
        expect(env.get("baz")).toBeUndefined();
        expect(env.get("baz", "default value")).toBe("default value");

        expect(env.ensure("foo")).toBe("bar");
        expect(() => env.ensure("baz")).toThrow();
    });

    test("as", () => {
        const env = Env.factory<{n: string; x?: string}>({n: "1", x: undefined});

        expect(env.as("n", parseInt)).toBe(1);
        expect(env.as("x", parseInt)).toBeUndefined();
        expect(env.as("x", parseInt, 10)).toBe(10);
    });
});
