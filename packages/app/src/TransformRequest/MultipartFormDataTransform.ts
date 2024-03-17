import {randomBytes} from "crypto";
import {tmpdir} from "os";
import {join} from "path";
import {createWriteStream} from "fs";
import {QueryString} from "@bunt/util";
import busboy from "busboy";
import {Defer} from "@bunt/async";
import {IRequest} from "../interfaces.js";

export const MultipartFormDataTransform = async <T = unknown>(request: IRequest): Promise<T> => {
    request.headers.assert("Content-Type", (value) => value.startsWith("multipart/form-data"));
    const bb = busboy({
        headers: request.headers.toJSON(),
        defCharset: "utf-8",
        defParamCharset: "utf-8",
    });

    const rs = await request.createReadableStream();
    const defer = new Defer<void>();
    const pending: Defer<void>[] = [];

    const qs = new QueryString();

    bb
        .on("file", (name, file, info) => {
            const {encoding, filename, mimeType} = info;
            const tmpname = join(
                tmpdir(),
                `${randomBytes(4).toString("hex")}-${Buffer.from(filename, "utf-8").toString("hex")}`,
            );

            const value = {
                filename,
                encoding,
                mimeType,
                tmpname,
            };

            qs.push(name, value);

            const def = new Defer<void>();
            pending.push(def);

            file
                .pipe(createWriteStream(tmpname))
                .on("close", () => def.resolve());
        })
        .on("field", (name, value) => {
            try {
                qs.push(name, JSON.parse(value));
            } catch {
                // skip
            }
        })
        .on("close", () => defer.resolve());

    rs.pipe(bb);

    await defer;
    await Promise.all(pending);

    return qs.toObject();
};
