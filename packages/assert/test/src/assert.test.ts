import {assert} from "../../src";

test("assert", () => {
    expect(() => assert(false)).toThrow();
    expect(() => assert(true)).not.toThrow();
});
