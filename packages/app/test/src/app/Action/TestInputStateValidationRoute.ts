import {DateTime, Fields, Text, Varchar} from "@bunt/input";
import {Action} from "@bunt/unit";
import {RegexpMatcher, Resolver, Route, RouteRule} from "../../../../src";
import {BaseContext} from "../Context/BaseContext";

export interface ITestTypeValidationState {
    session: string;
    payload: {
        name: string;
        bd?: Date;
    };
}

class TestInputStateValidationAction extends Action<BaseContext, ITestTypeValidationState> {
    public run(): Record<string, any> {
        const {session, payload} = this.state;
        
        return {
            session,
            welcome: `Hello, ${payload.name} (age: ${payload.bd?.toDateString() ?? "N/A"})!`,
            bd: payload.bd,
        };
    }
}

const route = Route.create(RegexpMatcher.factory);
export const type = new Fields<ITestTypeValidationState>({
    session: new Varchar({min: 8, max: 256}),
    payload: new Fields({name: Text, bd: DateTime}),
});

export const resolver = new Resolver<TestInputStateValidationAction>({
    session: ({request: {headers}}) => headers.get("authorization"),
    payload: ({request}) => request.toObject(),
});

export default route(TestInputStateValidationAction, new RouteRule("/test", type, resolver));
