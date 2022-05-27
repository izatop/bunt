import {ServiceFactory, Context} from "../../src";
import {MemoryDb} from "./context/services/MemoryDb";
import {MemoryDbServiceResolver} from "./context/services/MemoryDbServiceResolver";
import {TestService} from "./service/TestService";

describe("Service", () => {
    const table: [string, (v: string) => any][] = [
        ["p1", (p) => new MemoryDbServiceResolver(p)],
        ["p2", (p) => new ServiceFactory(() => MemoryDb.connect(p))],
        ["p3", (p) => ServiceFactory.create(() => MemoryDb.connect(p))],
        ["p4", (p) => ServiceFactory.create(MemoryDb.connect(p))],
    ];

    test("Resolve", async () => {
        for (const [p, f] of table) {
            const service = await f(p).resolve();
            expect(service).toBeInstanceOf(MemoryDb);
            expect(service.prefix).toBe(p);
        }
    });

    test("Ref", async () => {
        const service = new TestService();

        expect(await Context.resolve(service)).toEqual({service: "test"});
    });
});
