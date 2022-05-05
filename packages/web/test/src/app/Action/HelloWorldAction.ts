import {Action} from "@bunt/unit";
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
