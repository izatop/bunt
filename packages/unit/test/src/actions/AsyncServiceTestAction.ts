import {Action} from "../../../src";
import {MainContext} from "../context/MainContext";

export class AsyncServiceTestAction extends Action<MainContext, {key: string}> {
    public async run(): Promise<string> {
        const {key} = this.state;
        const {memoryDb, randomBytes} = this.context;
        const value = randomBytes.toString("hex");
        memoryDb.set(key, value);

        return value;
    }
}
