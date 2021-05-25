import {Disposable, dispose, Heartbeat} from "../../src";

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

        expect(pending).toEqual([2, 3, 1]);
    });

    test("should dispose heartbeat", async () => {
        const pending: number[] = [];
        const disposable1 = {
            async dispose() {
                pending.push(1);
            },
            getHeartbeat() {
                return Heartbeat.create(this, (fn) => {
                    pending.push(2);
                    Disposable.attach(this, () => {
                        pending.push(3);
                        fn();
                    });
                });
            },
        };

        const heartbeat = disposable1.getHeartbeat();
        await disposable1.dispose();
        await expect(heartbeat.watch()).resolves.toBeUndefined();
        expect(pending).toEqual([2, 3, 1]);
    });
});
