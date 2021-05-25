import {Context} from "@bunt/unit";
import {Handler} from "../../../src";
import {HelloAsk} from "./HelloAsk";

export class HelloHandler extends Handler<Context, HelloAsk> {
    public run(): string {
        return `Hello, ${this.payload}`;
    }
}
