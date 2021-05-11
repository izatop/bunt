import {ILogable, isFunction, Promisify} from "@bunt/util";
import {Application} from "../Application";
import {IHeaders, IRequestMessage, IRequestTransform, RequestTransformType} from "../interfaces";
import {fromJsonRequest} from "./Request";

export abstract class RequestMessageAbstract implements IRequestMessage, ILogable<{ route: string }> {
    public abstract readonly route: string;
    public abstract readonly headers: IHeaders;

    public async getBuffer(): Promise<Buffer> {
        const chunks: Buffer[] = [];
        const readableStream = await this.createReadableStream();
        for await (const chunk of readableStream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

    public transform<T>(transformer: RequestTransformType<T>): Promise<T> {
        if (isFunction(transformer)) {
            return transformer(this);
        }

        return transformer.transform(this);
    }

    public async to<T>(transform: IRequestTransform<T>): Promise<T> {
        this.headers.assert("content-type", [transform.type].flat(1));
        return transform(await this.getBuffer());
    }

    public toObject<T = unknown>(): Promise<T> {
        return this.to<unknown>(fromJsonRequest) as Promise<T>;
    }

    public async toString(): Promise<string> {
        const buffer = await this.getBuffer();
        return buffer.toString("utf-8");
    }

    public abstract validate(app: Application<any>): boolean;

    public abstract createReadableStream(): Promisify<NodeJS.ReadableStream>;

    public getLogValue(): { route: string } {
        return {route: this.route};
    }
}
