import {dispose} from "../../src";
import {DisposerTarget, Target, disposedIds} from "./disposable";

describe("Disposable", () => {
    test("dispose(disposable)", async () => {
        const target1 = new Target("Target (1)");
        dispose(target1);
        expect(disposedIds.has(target1.id));

        const target2 = "Target (2)";
        dispose(() => {
            disposedIds.add(target2);
        });

        expect(disposedIds.has(target2)).toBeTruthy();
    });

    test("disposer.dispose()", async () => {
        const target = new Target("Target (3)");
        const disposer = new DisposerTarget();
        disposer.onDispose(target);

        await dispose(target);
        expect(disposedIds.has("Target (3)"));
    });
});
