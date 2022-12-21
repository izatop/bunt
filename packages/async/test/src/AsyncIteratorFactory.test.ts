import {AsyncIteratorFactory, Defer} from "../../src";

describe("AsyncIteratorFactory", () => {
    test("Base test case", async () => {
        const values = new Array(10).fill(1).map((v, i) => v + i);
        const iterable = new AsyncIteratorFactory(async (control) => {
            control.on(() => Promise.resolve(void 0));
            for (const item of values) {
                control.push(item);
            }
        });

        const result = [];
        for await (const item of iterable) {
            result.push(item);
        }

        expect(result).toEqual(values);
    });

    test("Rejection test case", async () => {
        const iterable = new AsyncIteratorFactory(async () => {
            throw new Error("Rejection test case 1");
        });

        const iterator = iterable[Symbol.asyncIterator]();
        expect(iterator.next()).rejects.toThrow();
    });

    test("Dispose case", async () => {
        const defer = new Defer<void>();
        const iterable = new AsyncIteratorFactory<number>(async (control) => {
            control.push(1);
            control.on(async () => {
                defer.resolve();
            });

            return defer;
        });

        const res = [];
        for await (const item of iterable) {
            res.push(item);
            break;
        }

        expect(res).toEqual([1]);
        expect(defer.settled).toBe(true);
    });
});
