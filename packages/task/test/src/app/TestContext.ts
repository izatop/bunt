import {Context} from "@bunt/unit";
import {TestQueue} from "./TestQueue";

export class TestContext extends Context {
    public queue: TestQueue;

    constructor(queue: TestQueue) {
        super();

        this.queue = queue;
    }
}
