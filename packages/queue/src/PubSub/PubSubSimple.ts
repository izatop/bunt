import {PubSubAbstract} from "./PubSubAbstract";

export class PubSubSimple<S extends Record<string, any>> extends PubSubAbstract<S> {
    protected serialize<K extends keyof S>(message: S[K]): string {
        return JSON.stringify(message);
    }

    protected parse<K extends keyof S>(message: string): S[K] {
        return JSON.parse(message);
    }
}
