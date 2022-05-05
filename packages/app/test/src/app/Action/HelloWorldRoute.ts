import {Bool, Fields, Text, ToNumber} from "@bunt/input";
import {Action} from "@bunt/unit";
import {Resolver, route, RouteRule} from "../../../../src";
import {BaseContext} from "../Context/BaseContext";

interface IHelloWorldActionState {
    id: number;
    payload: {
        name: string;
    };
    option?: boolean;
}

export class HelloWorldAction extends Action<BaseContext, IHelloWorldActionState> {
    public run(): string {
        const {payload} = this.state;
        
        return `Hello, ${payload.name}!`;
    }
}

export default route(
    HelloWorldAction,
    new RouteRule(
        "/u/:id",
        () => new Fields({
            id: ToNumber,
            payload: () => new Fields({name: Text}),
            option: Bool,
        }),
        new Resolver({
            id: ({args}) => args.get("id"),
            payload: ({request}) => request.toObject(),
            option: () => false,
        }),
    ),
);
