import {Action} from "../../../src";
import {BaseContext} from "../context/BaseContext";

export class ProfileTestAction extends Action<BaseContext> {
    public run(): boolean {
        return true;
    }
}
