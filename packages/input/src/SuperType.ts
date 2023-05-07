import {TypeAbstract} from "./TypeAbstract.js";

export abstract class SuperType<TValue, SValue> extends TypeAbstract<TValue> {
    protected readonly type: TypeAbstract<SValue>;

    constructor(type: TypeAbstract<SValue>) {
        super();
        this.type = type;
    }
}
