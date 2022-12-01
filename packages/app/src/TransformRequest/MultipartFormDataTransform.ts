import {randomBytes} from "crypto";
import {tmpdir} from "os";
import {join} from "path";
import {createWriteStream} from "fs";
import {Defer} from "@bunt/util";
import busboy from "busboy";
import {IRequest} from "../interfaces";

export const MultipartFormDataTransform = async <T = unknown>(request: IRequest): Promise<T> => {
    request.headers.assert("Content-Type", (value) => value.startsWith("multipart/form-data"));
    const bb = busboy({headers: request.headers.toJSON()});
    const rs = await request.createReadableStream();
    const defer = new Defer<unknown>();
    const result: Record<string, any> = {};
    const pending: Defer<void>[] = [];

    bb
        .on("file", (name, file, info) => {
            const {encoding, filename, mimeType} = info;
            const tmpname = join(
                tmpdir(),
                randomBytes(4).toString("hex"),
                Buffer.from(filename, "utf-8").toString("hex"),
            );

            const value = {
                filename,
                encoding,
                mimeType,
                tmpname,
            };

            if (name.endsWith("[]")) {
                result[name] = [...(result[name] ?? []), value];
            } else {
                result[name] = value;
            }

            const def = new Defer<void>();
            pending.push(def);

            file
                .pipe(createWriteStream(tmpname))
                .on("close", () => def.resolve());
        })
        .on("field", (name, value) => result[name] = value)
        .on("close", () => defer.resolve(result));

    rs.pipe(bb);

    await Promise.all(pending);

    return defer.then((res) => res as T);
};
