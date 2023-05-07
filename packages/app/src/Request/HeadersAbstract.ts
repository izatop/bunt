import {assert, ILogable, isBoolean, isFunction} from "@bunt/util";
import {HeaderAssertValue, IHeaders} from "../interfaces.js";
import {StrictKeyValueMap} from "./StrictKeyValueMap.js";

export abstract class HeadersAbstract extends StrictKeyValueMap
    implements IHeaders, ILogable<{[key: string]: string}> {

    public assert(header: string, expected: HeaderAssertValue): void {
        const clientValue = this.get(header.toLowerCase());
        if (Array.isArray(expected)) {
            assert(
                expected.some((e) => clientValue.includes(e)),
                `Wrong header "${header}" value, allowed: ${expected.join(", ")}`,
            );
        }

        if (isFunction(expected)) {
            const result = expected(clientValue);
            if (isBoolean(result)) {
                assert(result, `Wrong ${header}`);
            }
        }
    }

    public getLogValue(): Record<any, any> {
        return this.toJSON();
    }
}
