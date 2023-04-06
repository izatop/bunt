import {dirname, resolve} from "node:path";
import {createReadStream} from "node:fs";
import {FileStorage, MinIO, MinIOBucketPolicy} from "../../src";

const fs = new FileStorage(new MinIO("http://minioadmin:minioadmin@localhost:9000"));

beforeAll(async () => {
    const b = fs.getBucket("test");
    await b.save();
    await b.setPolicy(MinIOBucketPolicy.PUBLIC_READONLY);
});

describe("MinIO", () => {
    test("put URL", async () => {
        const bucket = fs.getBucket("test");
        const stat = await bucket.put("url", new URL("https://www.google.com/favicon.ico"));
        expect(stat.size).toBeGreaterThan(0);
        expect(stat.lastModified).toBeInstanceOf(Date);
        expect(stat.metadata["content-type"]).toBe("image/x-icon");
        expect(stat.etag.length).toBeGreaterThan(0);
    });

    test("put string", async () => {
        const bucket = fs.getBucket("test");
        const stat = await bucket.put("string", "hello", {"content-type": "text/plain"});
        expect(stat.size).toBe(5);
        expect(stat.lastModified).toBeInstanceOf(Date);
        expect(stat.metadata["content-type"]).toBe("text/plain");
        expect(stat.etag.length).toBeGreaterThan(0);
    });

    test("put buffer", async () => {
        const bucket = fs.getBucket("test");
        const stat = await bucket.put("buffer", Buffer.from("hello"), {"content-type": "text/plain"});
        expect(stat.size).toBe(5);
        expect(stat.lastModified).toBeInstanceOf(Date);
        expect(stat.metadata["content-type"]).toBe("text/plain");
        expect(stat.etag.length).toBeGreaterThan(0);
    });

    test("put file", async () => {
        const bucket = fs.getBucket("test");
        const file = new URL(`file://${resolve(dirname(__filename), "./hello.txt")}`);
        const stat = await bucket.put("file", file, {"content-type": "text/plain"});
        expect(stat.size).toBe(6);
        expect(stat.lastModified).toBeInstanceOf(Date);
        expect(stat.metadata["content-type"]).toBe("text/plain");
        expect(stat.etag.length).toBeGreaterThan(0);
    });

    test("put readable", async () => {
        const bucket = fs.getBucket("test");
        const file = createReadStream(resolve(dirname(__filename), "./hello.txt"));
        const stat = await bucket.put("readable", file, {"content-type": "text/plain"});
        expect(stat.size).toBe(6);
        expect(stat.lastModified).toBeInstanceOf(Date);
        expect(stat.metadata["content-type"]).toBe("text/plain");
        expect(stat.etag.length).toBeGreaterThan(0);
    });
});
