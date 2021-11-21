import {Runtime} from "../../src";
import {disposedIds, Target} from "./disposable";
import {RunnableTarget} from "./disposable/RunnableTarget";

describe("Runtime", () => {
    test("dispose", async () => {
        const runtime = Runtime.run([
            () => new RunnableTarget(),
            () => new Target("runtime"),
        ]);

        const pendingTest = expect(runtime.watch())
            .resolves.not.toThrow();

        await Runtime.kill(0, "Testing reason");

        expect(disposedIds.has("runtime")).toBeTruthy();

        await pendingTest;
    });
});
