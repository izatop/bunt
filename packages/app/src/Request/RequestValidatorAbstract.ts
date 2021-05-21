import {Application} from "../Application";
import {IRequest} from "../interfaces";

export abstract class RequestValidatorAbstract<T extends Record<string, any>> {
    protected readonly options: T;

    constructor(options: T) {
        this.options = options;
    }

    public abstract validate(app: Application<any>, request: IRequest): void;
}
