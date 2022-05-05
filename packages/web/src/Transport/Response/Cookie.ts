export type StringifyCookieValue = {toString(): string};

export type SameSite = "Strict" | "Lax" | "None";

export type CookieOptions = {
    path?: string;
    domain?: string;
    secure?: boolean;
    httpOnly?: boolean;
    maxAge?: number;
    expires?: Date;
    sameSite?: SameSite;
};

export class Cookie {
    readonly #name: string;
    readonly #value: string;
    readonly #options: CookieOptions;

    constructor(name: string, value: string | StringifyCookieValue, options: CookieOptions = {}) {
        this.#name = name;
        this.#value = value.toString();
        this.#options = options;
    }

    public setPath(value?: string): void {
        this.#options.path = value;
    }

    public setDomain(value?: string): void {
        this.#options.domain = value;
    }

    public setSameSite(value?: SameSite): void {
        this.#options.domain = value;
    }

    public setExpires(value?: Date): void {
        this.#options.expires = value;
    }

    public setMaxAge(value?: number): void {
        this.#options.maxAge = value;
    }

    public setHttpOnly(value?: boolean): void {
        this.#options.httpOnly = value;
    }

    public setSecure(value?: boolean): void {
        this.#options.secure = value;
    }

    public serialize(): string {
        const {path, domain, expires, maxAge, sameSite, secure, httpOnly} = this.#options;
        const string = [`${this.#name}=${encodeURIComponent(this.#value)}`];

        if (domain) {
            string.push(`Domain=${domain}`);
        }

        if (path) {
            string.push(`Path=${path}`);
        }

        if (expires) {
            string.push(`Expires=${expires.toUTCString()}`);
        }

        if (maxAge) {
            string.push(`Max-Age=${maxAge}`);
        }

        if (httpOnly) {
            string.push("HttpOnly");
        }

        if (sameSite) {
            string.push(`SameSite=${sameSite}`);
        }

        if (secure) {
            string.push("Secure");
        }

        return string.join("; ");
    }
}
