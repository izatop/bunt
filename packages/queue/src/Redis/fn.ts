import {parse} from "url";
import {isString} from "@bunt/util";
import RedisClient, {Redis, RedisOptions} from "ioredis";

const toBoolean = (value: string): boolean => {
    return ["Y", "y", "1", "true"].includes(value);
};

const normalize: Record<string, (v: string) => any> = {
    db: Number,
    dropBufferSupport: toBoolean,
    enableReadyCheck: toBoolean,
    enableOfflineQueue: toBoolean,
    connectTimeout: Number,
    disconnectTimeout: Number,
    commandTimeout: Number,
    autoResubscribe: toBoolean,
    autoResendUnfulfilledCommands: toBoolean,
    lazyConnect: toBoolean,
    maxRetriesPerRequest: Number,
    readOnly: toBoolean,
    stringNumbers: toBoolean,
    enableAutoPipelining: toBoolean,
    maxScriptsCachingTime: Number,
};

export function createConnection(dsn?: string, options?: RedisOptions): Redis {
    if (dsn) {
        const {hostname, port, query} = parse(dsn, true);
        const queryOptions = {};

        for (const [key, value] of Object.entries(query)) {
            if (isString(value) && Reflect.has(normalize, key)) {
                Reflect.set(queryOptions, key, normalize[key](value));
            }
        }

        return new RedisClient({
            host: hostname ?? "localhost",
            port: +(port ?? 6379),
            ...queryOptions,
            ...options,
        });
    }

    return new RedisClient();
}
