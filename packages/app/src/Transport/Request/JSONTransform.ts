import {IRequestMessage, IRequestTransform} from "../../interfaces";

export const JSONTransform = async <T>(request: IRequestMessage): Promise<T> => {
    request.headers.assert("content-type", ["application/json"]);
    const buffer = await request.getBuffer();
    return JSON.parse(buffer.toString("utf-8"));
};

export const fromJsonRequest: IRequestTransform<unknown> = Object.assign(
    (buffer: Buffer) => JSON.parse(buffer.toString("utf-8")),
    {type: "application/json"},
);
