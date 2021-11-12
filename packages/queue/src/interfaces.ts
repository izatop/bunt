import {Context, IDisposable} from "@bunt/unit";
import {Promisify} from "@bunt/util";
import {Handler} from "./Handler";
import {IQueueList, IQueueReader, Message, MessageCtor, MessageHandler, MessagePayload, TaskAbstract} from "./Queue";

export type ActionHandler<C extends Context, M extends Message> = Handler<C, M>;

export type HandlerReturn<M extends Message> = M extends TaskAbstract<any, infer R>
    ? Promisify<R>
    : Promisify<void>;

export type HandlerState<M extends Message> = {payload: MessagePayload<M>};

export interface ITransport extends IDisposable {
    send<M extends Message>(message: M): Promisify<void>;

    getQueueList<M extends Message>(type: MessageCtor<M>, handler: MessageHandler<M>): IQueueList<M>;

    getQueueReader<M extends Message>(type: MessageCtor<M>): IQueueReader<M>;
}
