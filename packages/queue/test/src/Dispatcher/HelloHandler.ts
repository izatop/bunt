import {IContext} from "@bunt/unit";
import {Handler} from "../../../src";
import {HelloAsk} from "./HelloAsk";

export class HelloHandler extends Handler<IContext, HelloAsk> {
    public run(): string {
        return `Hello, ${this.payload}`;
    }
}
