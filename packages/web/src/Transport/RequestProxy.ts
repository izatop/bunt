import {StateType} from "@bunt/unit";
import {assert} from "@bunt/util";
import {RequestMessage} from "./RequestMessage";

const map = new WeakMap<any, RequestProxy>();

export class RequestProxy {
    readonly #request: RequestMessage;

    constructor(request: RequestMessage) {
        this.#request = request;
    }

    public static linkState(ref: StateType, proxy: RequestProxy) {
        map.set(ref, proxy);
    }

    public static getStateLink(ref: StateType): RequestProxy {
        const proxy = map.get(ref);
        assert(proxy, "Unexpected error");

        return proxy;
    }

    public get cookies() {
        return this.#request.cookies;
    }

    public get host() {
        return this.#request.host;
    }

    public get userAgent() {
        return this.#request.userAgent;
    }

    public get remoteAddress() {
        return this.#request.remoteAddress;
    }

    public get origin() {
        return this.#request.origin;
    }
}
