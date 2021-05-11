import {Action, Context, MatchContext} from "@bunt/unit";
import {Promisify} from "@bunt/util";
import {Application} from "./Application";
import {IRoute} from "./Route";

export type RouteResponse = Error
    | { stringify(): string }
    | NodeJS.ReadableStream
    | Buffer
    | string
    | number
    | boolean
    | null
    | undefined
    | void
    | any;

export type RouteAction = Action<any, any>;

export type MatchRoute<C extends Context, R> = R extends IRoute<infer A>
    ? A extends Action<infer AC, any, RouteResponse>
        ? MatchContext<C, AC> extends AC
            ? R
            : ["Action context doesn't match its parent context", C, AC]
        : ["Action doesn't satisfy its interface", A]
    : never;

export interface IKeyValueMap {
    has(name: string): boolean;

    get(name: string, defaultValue?: string): string;

    set(name: string, value: string): void;

    delete(name: string): void;

    entries(): [string, string][];

    toJSON(): { [key: string]: string };
}

export interface IRequestBodyTransform<T> {
    transform(request: IRequestMessage): Promise<T>;
}

export type RequestTransformType<T> = IRequestBodyTransform<T> | ((request: IRequestMessage) => Promise<T>);

export interface IRequestTransform<T> {
    type: string | string[];

    (buffer: Buffer): T;
}

export interface IRequestMessage {
    readonly route: string;
    readonly headers: IHeaders;

    to<T>(transform: IRequestTransform<T>): Promise<T>;

    toObject<T = unknown>(): Promise<T>;

    toString() : Promise<string>;

    getBuffer(): Promise<Buffer>;

    createReadableStream(): Promisify<NodeJS.ReadableStream>;

    transform<T>(transformer: RequestTransformType<T>): Promise<T>;

    validate(app: Application<any>): boolean;
}

export interface IResponder extends IRequestMessage {
    readonly complete: boolean;

    respond(response: RouteResponse): Promise<void>;
}

/**
 * @deprecated see IResponder
 */
export interface IRequest extends IResponder {}

export type HeaderAssertValue = |
    string |
    string[] |
    ((value: string) => boolean | void);

export interface IHeaders extends IKeyValueMap {
    assert(header: string, values: HeaderAssertValue): void;
}
