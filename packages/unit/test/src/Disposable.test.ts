import {Disposable, dispose} from "../../src";

describe("Disposable", () => {
    test("should dispose all callbacks", async () => {
        const pending: number[] = [];
        const disposable1 = {
            async dispose() {
                pending.push(1);
            },
        };

        const disposable2 = () => {
            pending.push(2);
        };

        Disposable.attach(disposable1, disposable2);

        const disposable3 = {
            async dispose() {
                pending.push(3);
            },
        };

        Disposable.attach(disposable1, disposable3);

        await dispose(disposable1);

        expect(pending).toEqual([1, 2, 3]);
    });
});
