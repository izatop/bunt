import {IDisposable} from "@bunt/unit";
import {Promisify} from "@bunt/util";
import {MessageAbstract, TaskAbstract} from "./Message/index.js";

export interface IReadOperationState<M extends Message> {
    error?: Error;
    status: boolean;
    message: M;
    finishAt: Date;
    runAt: Date;
}

export interface IReadOperationSuccess<M extends Message> extends IReadOperationState<M> {
    status: true;
    error?: never;
}

export interface IReadOperationFail<M extends Message> extends IReadOperationState<M> {
    status: false;
    error: Error;
}

export type OperationReleaseState<M extends Message> = IReadOperationSuccess<M> | IReadOperationFail<M>;

export interface IReadOperation<M extends Message> {
    readonly message: M;
    readonly channel: string;

    commit(): Promise<OperationReleaseState<M>>;

    rollback(reason?: Error): Promise<IReadOperationFail<M>>;
}

export interface IQueueReader<M extends Message, RO extends IReadOperation<M> = IReadOperation<M>>
    extends IDisposable {
    readonly channel: string;

    read(): Promise<RO | undefined>;

    cancel(): Promise<void>;
}

export interface ITaskHandler<M extends TaskAbstract<any, any>> {
    (message: M): Promisify<TaskReply<M>>;
}

export type MessageHandler<M extends Incoming> = (message: M) => M extends TaskAbstract<any, any>
    ? Promisify<TaskReply<M>>
    : Promisify<any>;

export type QueueKeys<T> = Extract<keyof T, string>;

export interface IHandleReleaseFactory<M extends Message> {
    (): IReadOperationSuccess<M>;

    (error: Error): IReadOperationFail<M>;
}

export interface IQueueListWatcher<M extends Message> {
    (result: OperationReleaseState<M>): unknown;
}

export interface IQueueList<M extends Message> extends IDisposable {
    readonly subscribed: boolean;

    unsubscribe(): Promise<void>;

    subscribe(): Promise<void>;

    watch(fn: IQueueListWatcher<M>): void;
}

export type MessagePayload<M extends Message> = M extends MessageAbstract<infer P> ? P : never;

export type TaskReply<M extends Task> = M extends TaskAbstract<any, infer P> ? P : never;

export interface MessageCtor<M extends Incoming> {
    prototype: M;

    readonly channel: string;
    readonly concurrency: number;

    new(message: MessagePayload<M>): M;
}

export interface ITransactionType {
    getBackupKey(): string;

    getFallbackKey(): string;
}

export type Task = TaskAbstract<any, any>;
export type Message = MessageAbstract<any>;
export type Incoming = Task | Message;

export interface IMessageSerializer {
    serialize(): string;
}

export interface IMessageParser<T> {
    parse(value: T): string;
}
