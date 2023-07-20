import {Promisify} from "@bunt/util";

export enum GQLOperationType {
    Ping = "ping",
    Pong = "pong",
    Complete = "complete",
}

export enum GQLClientOperationType {
    ConnectionInit = "connection_init",
    Subscribe = "subscribe",

    //CONNECTION_INIT = "connection_init_",
    //CONNECTION_TERMINATE = "connection_terminate",
    //START = "start",
    //STOP = "stop",
}

export enum GQLServerOperationType {
    ConnectionAck = "connection_ack",
    Next = "next",
    Error = "error",

    //CONNECTION_ACK = "connection_ack",
    //CONNECTION_ERROR = "connection_error",
    //CONNECTION_KEEP_ALIVE = "ka",
    //NEXT = "next",
    //DATA = "data",
    //ERROR = "error",
    //COMPLETE = "complete",
}

export interface ExecutionResult<
    TData = Record<string, unknown>,
    TExtensions = Record<string, unknown>,
> {
    errors?: ReadonlyArray<GQLError>;
    data?: TData | null;
    extensions?: TExtensions;
}

export type GQLError = {
    message: string;
    [key: string]: any;
};

export type GQLConnectionParams = Record<string, any>;

export type GQLClientPayload = {
    query: string;
    operationName?: string | null;
    variables?: Record<string, unknown> | null;
    extensions?: Record<string, unknown> | null;
};

export type GQLServerResponse = {
    data: any;
    errors?: GQLError[];
};

export interface IGQLOperationConnectionInit {
    type: GQLClientOperationType.ConnectionInit;
    payload: GQLConnectionParams;
}

export interface IGQLOperationConnectionAsk {
    type: GQLServerOperationType.ConnectionAck;
}

export interface IGQLOperationPing {
    type: GQLOperationType.Ping;
}

export interface IGQLOperationPong {
    type: GQLOperationType.Pong;
}

export interface IGQLOperationSubscribe {
    id: string;
    type: GQLClientOperationType.Subscribe;
    payload: GQLClientPayload;
}

export interface IGQLOperationNext {
    id: string;
    type: GQLServerOperationType.Next;
    payload: Record<any, any>;
}

export interface IGQLOperationError {
    id: string;
    type: GQLServerOperationType.Error;
    payload: GQLError[];
}

export interface IGQLOperationComplete {
    id: string;
    type: GQLOperationType.Complete;
}

export type GQLClientOperation = IGQLOperationConnectionInit
| IGQLOperationConnectionInit
| IGQLOperationPing
| IGQLOperationPong
| IGQLOperationSubscribe
| IGQLOperationError
| IGQLOperationComplete
;

export type GQLServerOperation = IGQLOperationConnectionAsk
| IGQLOperationPing
| IGQLOperationPong
| IGQLOperationNext
| IGQLOperationError
| IGQLOperationComplete
;

export type GQLOperationMessage = GQLClientOperation | GQLServerOperation;

export type GQLSubscribeFunction = (payload: GQLClientPayload,
    params: Record<string, any>) => Promisify<AsyncIterableIterator<any>>;

export type GQLInitFunction = (params: Record<string, any>) => unknown;
