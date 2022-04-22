import {Fields, Text} from "@bunt/input";
import {asyncify} from "@bunt/unit";
import {Resolver, route, RouteRule} from "../../../../src";

export default route(
    asyncify(() => import("./BaseTestAction")),
    new RouteRule(
        "GET /async/test",
        new Fields({name: Text}),
        new Resolver({name: () => "async"}),
    ),
);
