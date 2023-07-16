import {IHeaders} from "@bunt/app";
import {StateType} from "@bunt/unit";
import {assert} from "@bunt/util";
import {Cookies} from "./Cookies.js";
import {RequestMessage} from "./RequestMessage.js";

const map = new WeakMap<any, RequestProxy>();

export class RequestProxy {
    readonly #request: RequestMessage;

    constructor(request: RequestMessage) {
        this.#request = request;
    }

    public static linkState(ref: StateType, proxy: RequestProxy): void {
        map.set(ref, proxy);
    }

    public static getStateLink(ref: StateType): RequestProxy {
        const proxy = map.get(ref);
        assert(proxy, "Unexpected error");

        return proxy;
    }

    public get headers(): IHeaders {
        return this.#request.headers;
    }

    public get authorization(): string {
        return this.#request.headers.get("authorization", "");
    }

    public get url(): URL {
        return this.#request.url;
    }

    public get cookies(): Cookies {
        return this.#request.cookies;
    }

    public get host(): string {
        return this.#request.host;
    }

    public get userAgent(): string {
        return this.#request.userAgent;
    }

    public get remoteAddress(): string {
        return this.#request.remoteAddress;
    }

    public get origin(): string {
        return this.#request.origin;
    }
}
