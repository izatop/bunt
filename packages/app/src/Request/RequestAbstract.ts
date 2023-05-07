import {ILogable, isFunction, Promisify} from "@bunt/util";
import {Application} from "../Application.js";
import {IHeaders, IKeyValueMap, IRequest, IRequestTransform, RequestTransformType} from "../interfaces.js";
import {
    fromJsonRequest,
    fromTextRequest,
    MultipartFormDataTransform,
    URLEncodedFormTransform,
} from "../TransformRequest/index.js";

export abstract class RequestAbstract implements IRequest, ILogable<{route: string}> {
    public abstract readonly route: string;
    public abstract readonly headers: IHeaders;
    public abstract readonly params: IKeyValueMap;

    /**
     * Get a request body as the Buffer object
     */
    public async getBuffer(): Promise<Buffer> {
        const chunks: Buffer[] = [];
        const readableStream = await this.createReadableStream();
        for await (const chunk of readableStream) {
            chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
        }

        return Buffer.concat(chunks);
    }

    /**
     * Transform RequestMessage with transformer
     *
     * @param transformer
     */
    public transform<T>(transformer: RequestTransformType<T>): Promise<T> {
        if (isFunction(transformer)) {
            return transformer(this);
        }

        return transformer.transform(this);
    }

    /**
     * Serialize request with transform function.
     *
     * @param transform
     */
    public async to<T>(transform: IRequestTransform<T>): Promise<T> {
        this.headers.assert("content-type", [transform.type].flat(1));

        return transform(await this.getBuffer());
    }

    /**
     * Serialize the request body to object.
     */
    public toObject<T = unknown>(): Promise<T> {
        const [contentType] = this.headers.get("content-type").split(";");
        switch(contentType) {
            case "multipart/form-data":
                return this.transform<T>(MultipartFormDataTransform);
            case "application/x-www-form-urlencoded":
                return this.transform<T>(URLEncodedFormTransform);
        }

        return this.to(fromJsonRequest) as Promise<T>;
    }

    /**
     * Serialize a request body to string.
     */
    public async toString(): Promise<string> {
        return this.to(fromTextRequest);
    }

    public abstract validate(app: Application<any>): boolean;

    public abstract createReadableStream(): Promisify<NodeJS.ReadableStream>;

    public getLogValue(): {route: string} {
        return {route: this.route};
    }
}
