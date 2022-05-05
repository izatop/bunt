import {ServiceFactory, Context, SERVICE_KIND} from "../../src";
import {MemoryDb} from "./context/services/MemoryDb";
import {MemoryDbServiceResolver} from "./context/services/MemoryDbServiceResolver";

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
        const service = {
            [SERVICE_KIND]: true,
            async resolve() {
                return {service: "test"};
            },
        };

        expect(await Context.resolve(service)).toEqual({service: "test"});
    });
});
