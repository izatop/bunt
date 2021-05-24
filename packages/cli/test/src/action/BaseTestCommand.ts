import {Command} from "../../../src";
import {IBaseContext} from "../context/BaseContext";

export class BaseTestCommand extends Command<IBaseContext, { name: string }> {
    public execute(): void {
        return;
    }
}
