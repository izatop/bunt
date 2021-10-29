import {assert} from "@bunt/util";
import * as crypto from "crypto";
import {IHandleReleaseFactory, ITransactionType, Message, MessageCtor} from "./interfaces";

const serializeRe = /^[0-9a-f]{8}:.+$/;

export function serialize<M extends Message>(message: M): string {
    const body = JSON.stringify(message.payload);
    const signature = crypto.createHash("sha1")
        .update(body)
        .digest("hex")
        .substr(0, 8);

    return `${signature}:${body}`;
}

export function unserialize<T = unknown>(message: string): T {
    assert(serializeRe.test(message), "Wrong message format");

    const body = message.substr(9);
    const signature = message.substr(0, 8);
    const compareSignature = crypto.createHash("sha1")
        .update(body)
        .digest("hex")
        .substr(0, 8);

    assert(signature === compareSignature, "Wrong checksum");
    return JSON.parse(body);
}

export function tryUnserialize<T = unknown>(message?: string): T | undefined {
    if (!message) {
        return;
    }

    try {
        return unserialize(message);
    } catch (error) {
        // skip serialization error
        // eslint-disable-next-line
        console.warn(error);
    }
}

export function createReleaseState<M extends Message>(message: M): IHandleReleaseFactory<M> {
    const runAt = new Date();
    return ((error?: Error) => {
        if (error) {
            return {runAt, error, message, status: false, finishAt: new Date()};
        }

        return {
            runAt,
            message,
            finishAt: new Date(),
            status: true,
        };
    }) as IHandleReleaseFactory<M>;
}

export function isTransactionMessage(type: MessageCtor<any>): type is MessageCtor<any> & ITransactionType {
    return Reflect.has(type, "getBackupKey")
        && Reflect.has(type, "getFallbackKey");
}
