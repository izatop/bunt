import {all, AsyncPool} from "../../src";

describe("AsyncPool", () => {
    test("Base test case", async () => {
        const pool = new AsyncPool<number>();
        const value = pool.pull();
        expect(value).toBeInstanceOf(Promise);

        pool.push(1);
        await expect(value).resolves.toBe(1);
    });

    test("Rejection test case", async () => {
        const pool = new AsyncPool<number>();

        const reject = pool.pull();
        pool.reject(new Error("Test"));
        await expect(reject).rejects.toThrowError();
        expect(() => pool.reject(new Error())).toThrowError();
    });

    test("Reverse rejection test case", async () => {
        const pool = new AsyncPool<number>();

        pool.reject(new Error("Test"));
        await expect(pool.pull()).rejects.toThrowError();
    });

    test("Multiple pull case", async () => {
        const pool = new AsyncPool<number>();
        const pending = [
            pool.pull(),
            pool.pull(),
        ];

        pool.push(1);

        await expect(all(pending)).resolves.toEqual([1, 1]);
    });
});
