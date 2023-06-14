import {TaskAbstract} from "../../../src/TaskAbstract";
import {define} from "../../../src/fn";
import {TaskIterator} from "../../../src/TaskIterator";
import {TestContext} from "./TestContext";

export interface ITestTaskState {
    id: number;
    value: number;
}

class TestTask extends TaskAbstract<TestContext, ITestTaskState> {
    public async run(): Promise<void> {
        return;
    }
}

export default define(TestTask, {
    factory: async (context) => new TaskIterator(
        async () => context.queue.next(),
        async () => context.queue.dispose(),
    ),
    dispose: async (context, task, payload) => {
        context.queue.finish(task, payload);
    },
});
