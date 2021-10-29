import {Promisify} from "@bunt/util";

export enum GQLClientOperationType {
    CONNECTION_INIT = "connection_init",
    CONNECTION_TERMINATE = "connection_terminate",
    START = "start",
    STOP = "stop",
}

export enum GQLServerOperationType {
    CONNECTION_ACK = "connection_ack",
    CONNECTION_ERROR = "connection_error",
    CONNECTION_KEEP_ALIVE = "ka",
    DATA = "data",
    ERROR = "error",
    COMPLETE = "complete",
}

export type GQLError = {
    message: string;
    [key: string]: any;
};

export type GQLConnectionParams = Record<string, any>;

export type GQLClientPayload = {
    query: string;
    variables?: Record<string, any>;
    operationName?: string;
};

export type GQLServerResponse = {
    data: any;
    errors?: GQLError[]; // @todo describe GQL error interface
};

export interface IGQLOperationConnectionAsk {
    type: GQLServerOperationType.CONNECTION_ACK;
}

export interface IGQLOperationConnectionError {
    type: GQLServerOperationType.CONNECTION_ERROR;
}

export interface IGQLOperationData {
    id: string;
    type: GQLServerOperationType.DATA;
    payload: GQLServerResponse;
}

export interface IGQLOperationError {
    id: string;
    type: GQLServerOperationType.ERROR;
    payload: GQLError;
}

export interface IGQLOperationComplete {
    id: string;
    type: GQLServerOperationType.COMPLETE;
}

export interface IGQLOperationConnectionKeepAlive {
    type: GQLServerOperationType.CONNECTION_KEEP_ALIVE;
}

export interface IGQLOperationConnectionInit {
    type: GQLClientOperationType.CONNECTION_INIT;
    payload: GQLConnectionParams;
}

export interface IGQLOperationConnectionTerminate {
    type: GQLClientOperationType.CONNECTION_TERMINATE;
}

export interface IGQLOperationStart {
    id: string;
    type: GQLClientOperationType.START;
    payload: GQLClientPayload;
}

export interface IGQLOperationStop {
    type: GQLClientOperationType.STOP;
    id: string;
}

export type GQLClientOperation = IGQLOperationConnectionInit
| IGQLOperationConnectionTerminate
| IGQLOperationStart
| IGQLOperationStop;

export type GQLServerOperation = IGQLOperationConnectionAsk
| IGQLOperationConnectionError
| IGQLOperationConnectionKeepAlive
| IGQLOperationData
| IGQLOperationError
| IGQLOperationComplete;

export type GQLOperationMessage = GQLClientOperation | GQLServerOperation;

export type GQLSubscribeFunction = (payload: GQLClientPayload,
    params: Record<string, any>) => Promisify<AsyncIterableIterator<any>>;

export type GQLInitFunction = (params: Record<string, any>) => unknown;
