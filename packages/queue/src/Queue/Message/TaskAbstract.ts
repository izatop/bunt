import {IncomingMessageAbstract} from "./IncomingMessageAbstract.js";
import {MessageAbstract} from "./MessageAbstract.js";

export abstract class TaskAbstract<T, R> extends IncomingMessageAbstract<T> {
    public abstract reply(reply: R): MessageAbstract<R>;
}
