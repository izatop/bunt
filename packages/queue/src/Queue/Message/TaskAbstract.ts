import {IncomingMessageAbstract} from "./IncomingMessageAbstract";
import {MessageAbstract} from "./MessageAbstract";

export abstract class TaskAbstract<T, R> extends IncomingMessageAbstract<T> {
    public abstract reply(reply: R): MessageAbstract<R>;
}
