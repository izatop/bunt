import {Action} from "@bunt/unit";
import {IBaseContext} from "../Context/BaseContext";

interface IHelloWorldActionState {
    id: number;
    payload: {
        name: string;
    };
    option?: boolean;
}

export class HelloWorldAction extends Action<IBaseContext, IHelloWorldActionState> {
    public run(): string {
        const {payload} = this.state;
        return `Hello, ${payload.name}!`;
    }
}
