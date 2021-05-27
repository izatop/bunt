import {Disposable, dispose, Heartbeat} from "../../src";

describe("Disposable", () => {
    test("should dispose in any use cases", async () => {
        const pending: number[] = [];

        // use case 1
        const disposable1 = {
            async dispose() {
                pending.push(1);
            },
        };

        Disposable.attach(disposable1, () => {
            pending.push(2);
        });

        const disposable3 = {
            async dispose() {
                pending.push(3);
            },
        };

        Disposable.attach(disposable1, disposable3);

        await dispose(disposable1);

        expect(pending).toEqual([3, 2, 1]);
        pending.splice(0);

        // use case 2
        const disposable4 = {
            async dispose() {
                pending.push(1);
            },
            getHeartbeat() {
                return Heartbeat.create(this);
            },
        };

        const heartbeat = disposable4.getHeartbeat();
        expect(heartbeat.beats).toBe(true);

        await dispose(disposable4);
        await expect(heartbeat.watch()).resolves.toBeUndefined();
        expect(pending).toEqual([1]);
        pending.splice(0);

        // use case 3
        const disposable5 = {
            async dispose() {
                pending.push(1);
            },
        };

        const disposable6 = {
            async dispose() {
                pending.push(2);
            },
        };

        Disposable.resolve(disposable5);
        Disposable.resolve(disposable6);

        expect(Disposable.size).toBe(2);
        await Disposable.disposeAll();

        expect(Disposable.size).toBe(0);
        expect(pending).toEqual([1, 2]);
    });
});
