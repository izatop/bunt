import {RequestValidatorAbstract} from "@bunt/app";
import {IncomingMessage} from "http";
import {Socket} from "net";
import {Responder} from "./Responder";

export type ServerHeadersResolver = (request: Responder) => {[key: string]: string};

export type ServerRequestHandler<T = void> = (request: Responder) => T;

export interface ICorsOptions {
    origin?: string | ServerRequestHandler<string> | "origin";
    credentials?: boolean;
}

export interface IRequestMessageOptions {
    validators?: RequestValidatorAbstract<any> | RequestValidatorAbstract<any>[];
}

export interface IResponderOptions extends IRequestMessageOptions {
    headers?: {[key: string]: string} | ServerHeadersResolver;
}

export interface IRequestSendOptions {
    code: number;
    status?: string;
    headers?: {[key: string]: string};
}

export interface IProtocolAcceptor {
    protocol: string;
    handle: (req: IncomingMessage, socker: Socket, head: Buffer) => void;
}
