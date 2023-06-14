import {assert} from "@bunt/assert";
import {isArray, isDefined} from "@bunt/is";
import {KeyOf} from "@bunt/type";
import {XMap} from "@bunt/util";

export type DSNOptions<O extends Record<string, any> = Record<string, any>> = O;

export interface IDSNConnection<O extends DSNOptions> {
    host: string;
    port?: number;
    path?: string;
    schema?: string;
    credentials?: string;
    options: O;
}

export interface IDSNAuthorizationPairs {
    username: string;
    password?: string;
}

export class DSN<O extends DSNOptions> {
    readonly #dsn: string;
    readonly #connection: IDSNConnection<O>;

    protected constructor(dsn: string, connection: IDSNConnection<O>) {
        this.#dsn = dsn;
        this.#connection = connection;
    }

    public get<K extends KeyOf<O>>(key: K, defaultValue: O[K]): O[K] {
        return this.#connection.options[key] ?? defaultValue;
    }

    public get schema(): string | undefined {
        return this.#connection.schema;
    }

    public get host(): string {
        return this.#connection.host;
    }

    public get port(): number | undefined {
        return this.#connection.port;
    }

    public get path(): string | undefined {
        return this.#connection.path;
    }

    public get credentials(): string | undefined {
        return this.#connection.credentials;
    }

    public get options(): O {
        return this.#connection.options;
    }

    public getAuthorizationPairs(): IDSNAuthorizationPairs | undefined {
        if (this.credentials) {
            const [username, password] = this.credentials.split(":");

            return {username, password};
        }
    }

    public static serialize = (dsn: DSN<any>): string => {
        const parts = [
            [dsn.schema, "://"],
            [dsn.credentials, "@"],
            [dsn.host],
            [":", dsn.port],
            [dsn.path],
            ["?", this.serializeOptions(dsn.options)],
        ];

        return parts
            .filter((sub) => sub.every(isDefined))
            .map((sub) => sub.join(""))
            .join("");
    };

    public static parse = <O extends DSNOptions>(dsn: string): DSN<O> => {
        const patterns = [
            "^",
            "((?<schema>[^:]+)://)?", // scheme
            "((?<credentials>[^@]+)@)?", // credentials
            "(?<host>[^:/?]+)", // host
            "(:(?<port>[^/?]+))?", // port
            "(?<path>/[^?]*)?", // path
            "(\\?(?<query>.+))?", // query
            "$",
        ];

        const re = new RegExp(patterns.join(""));
        const result = dsn.match(re);
        assert(result, "DSN string is invalid", dsn);
        const {groups = {}} = result;
        assert(groups.host, "DSN host should contain host string");

        const options = this.parseOptions<O>(groups.query);

        return new DSN<O>(dsn, {
            host: groups.host,
            schema: groups.schema,
            credentials: groups.credentials,
            port: this.parsePort(groups.port),
            path: groups.path,
            options,
        });
    };

    protected static parsePort(port?: string): number | undefined {
        if (port) {
            const parsed = +port;
            assert(!isNaN(parsed), "DSN has an incorrect port value");
            assert(parsed >= 0 && parsed <= 65535, "DSN port should be in the valid port range (0-65535)");

            return parsed;
        }

        return undefined;
    }

    public static parseOptions<O extends DSNOptions>(query = ""): O {
        const params = new URLSearchParams(query);
        const entries = new XMap<string, string | string[]>();
        const initializer = (): string[] => [];
        for (const [key, value] of params) {
            if (key.endsWith("[]")) {
                const arrayKey = key.substring(0, key.length - 2);
                entries.ensure(arrayKey, initializer).push(value);
                continue;
            }

            entries.set(key, value);
        }

        return Object.fromEntries(entries) as O;
    }

    protected static serializeOptions(options: DSNOptions): string | undefined {
        const entries = Object.entries(options);
        if (entries.length > 0) {
            const query: string[] = [];
            for (const [key, value] of entries) {
                query.push(
                    isArray(value)
                        ? value.map((v) => [`${key}[]`, v].join("=")).join("&")
                        : [key, value].join("="),
                );
            }

            return query.join("&");
        }
    }

    public get dsn(): string {
        return this.#dsn;
    }
}
