import {StrictKeyValueMap} from "../../src";

describe("Transport", () => {
    test("StrictKeyValueMap", () => {
        const strictMap = StrictKeyValueMap.fromObject({A: "A", b: "B"});
        expect({a: "A", b: "B"}).toStrictEqual(strictMap.toJSON());
    });
});
