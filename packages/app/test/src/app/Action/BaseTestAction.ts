import {Action} from "@bunt/unit";
import {BaseContext} from "../Context/BaseContext";

export class BaseTestAction extends Action<BaseContext, {name: string}> {
    public run(): string {
        return `Hello, ${this.state.name}!`;
    }
}

export default BaseTestAction;
