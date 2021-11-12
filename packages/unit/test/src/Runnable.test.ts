import {RunnableTest} from "./runnable/RunnableTest";

describe("Runnable", () => {
    test("should beats until stop", async () => {
        const runnable = new RunnableTest();
        const heartbeat = runnable.getHeartbeat();
        expect(heartbeat.beats).toBeTruthy();
        runnable.destroy();

        await expect(heartbeat.watch()).resolves.toBeUndefined();
        expect(heartbeat.beats).toBeFalsy();
    });

    test("should beats until crashes", async () => {
        const runnable = new RunnableTest();
        const heartbeat = runnable.getHeartbeat();
        expect(heartbeat.beats).toBeTruthy();
        runnable.crash();

        await expect(heartbeat.watch()).rejects.toThrow();
        expect(heartbeat.beats).toBeFalsy();
    });
});
