import {IRequest, IRequestTransform} from "../interfaces";

export const JSONTransform = async <T>(request: IRequest): Promise<T> => {
    request.headers.assert("content-type", ["application/json"]);
    const buffer = await request.getBuffer();
    return JSON.parse(buffer.toString("utf-8"));
};

export const fromJsonRequest: IRequestTransform<unknown> = Object.assign(
    (buffer: Buffer) => JSON.parse(buffer.toString("utf-8")),
    {type: "application/json"},
);

export const fromTextRequest: IRequestTransform<string> = Object.assign(
    (buffer: Buffer) => buffer.toString("utf-8"),
    {type: "text/plain"},
);
