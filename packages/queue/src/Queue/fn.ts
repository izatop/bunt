import * as crypto from "crypto";
import {assert} from "@bunt/util";
import {
    IHandleReleaseFactory,
    IMessageParser,
    IMessageSerializer,
    ITransactionType,
    Message,
    MessageCtor,
    MessagePayload,
} from "./interfaces.js";
import {MessageAbstract} from "./Message/index.js";

const serializeRe = /^[0-9a-f]{8}:.+$/;

export function serialize<M extends Message>(message: M): string {
    const body = isMessageSerializer(message)
        ? message.serialize()
        : JSON.stringify(message.payload);

    const signature = crypto.createHash("sha1")
        .update(body)
        .digest("hex")
        .substring(0, 8);

    return `${signature}:${body}`;
}

export function unserialize<T, M extends MessageAbstract<T>>(type: MessageCtor<M>, message: string): T {
    assert(serializeRe.test(message), "Wrong message format");

    const body = message.substring(9);
    const signature = message.substring(0, 8);
    const compareSignature = crypto.createHash("sha1")
        .update(body)
        .digest("hex")
        .substring(0, 8);

    assert(signature === compareSignature, "Wrong checksum");

    return isMessageParser(type)
        ? type.parse(body) as T
        : JSON.parse(body) as T;
}

export function tryUnserialize<M extends MessageAbstract<any>>(type: MessageCtor<M>, message?: string)
    : MessagePayload<M> | undefined {
    if (!message) {
        return;
    }

    try {
        return unserialize(type, message);
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

export function isMessageSerializer<T, M extends MessageAbstract<T>>(target: M): target is M & IMessageSerializer {
    return "serialize" in target;
}

export function isMessageParser<T, M extends MessageAbstract<T>>(target: MessageCtor<M>)
    : target is MessageCtor<M> & IMessageParser<T> {
    return "parse" in target;
}
