import {DSN} from "../../src";

describe("DSN", () => {
    test("parse", () => {
        const variants = [
            "localhost",
            "redis.io:6379",
            "tcp://127.0.0.1:433",
            "https://user@localhost",
            "https://user:password@localhost/?a=1&b=2",
            "localhost?a=1",
            "localhost/db",
            "localhost:80/path/to?timeout=1",
            "protocol://localhost/?a[]=1&a[]=2",
        ];

        expect(variants.map(DSN.parse).map(DSN.serialize)).toEqual(variants);
    });
});
