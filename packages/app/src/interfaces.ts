import {Promisify} from "@bunt/type";
import {Application} from "./Application.js";

export type ActionResponse = Error
| {stringify(): string}
| Buffer
| string
| number
| boolean
| null
| undefined
| void
| any;

export interface IKeyValueMap {
    has(name: string): boolean;

    get(name: string, defaultValue?: string): string;

    set(name: string, value: string): void;

    delete(name: string): void;

    entries(): [string, string][];

    toJSON(): {[key: string]: string};
}

export interface IRequestBodyTransform<T> {
    transform(request: IRequest): Promise<T>;
}

export type RequestTransformType<T> = IRequestBodyTransform<T> | ((request: IRequest) => Promise<T>);

export interface IRequestTransform<T> {
    type: string | string[];

    (buffer: Buffer): T;
}

export interface IRequest {
    readonly route: string;
    readonly params: IKeyValueMap;
    readonly headers: IHeaders;

    to<T>(transform: IRequestTransform<T>): Promise<T>;

    toObject<T = unknown>(): Promise<T>;

    toString(): Promise<string>;

    getBuffer(): Promise<Buffer>;

    createReadableStream(): Promisify<NodeJS.ReadableStream>;

    transform<T>(transformer: RequestTransformType<T>): Promise<T>;

    validate(app: Application<any>): boolean;

    readonly linkState?: <S extends Record<string, unknown>>(state: S) => Promisify<void>;
}

export type HeaderAssertValue = |
string |
string[] |
((value: string) => boolean | void);

export interface IHeaders extends IKeyValueMap {
    assert(header: string, values: HeaderAssertValue): void;
}
