import {Action} from "../../../src";
import {BaseContext} from "../context/BaseContext";

export class BaseTestAction extends Action<BaseContext, {name: string}> {
    public run(): string {
        return `Hello, ${this.state.name}!`;
    }
}

export default BaseTestAction;
