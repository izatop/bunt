import {isArray, isInstanceOf} from "@bunt/util";
import {AssertionListError, AssertionTypeError, IReadableListField} from "../Assertion";
import {SuperType} from "../SuperType";

export class List<TValue> extends SuperType<TValue[], TValue> {
    public async validate(payload: unknown): Promise<TValue[]> {
        this.assert(isArray(payload), `Wrong payload: ${this.type.name}[] expected`, payload);

        let index = 0;
        const result: TValue[] = [];
        const validations = new Set<IReadableListField>();
        for (const item of payload) {
            try {
                result.push(await this.type.validate(item));
            } catch (error) {
                if (isInstanceOf(error, AssertionTypeError)) {
                    validations.add({index, ...error.toSafeJSON()});
                } else {
                    validations.add({
                        index,
                        payload: item,
                        message: error.message,
                        type: this.type.name,
                    });
                }
            }

            index++;
        }

        if (validations.size) {
            throw new AssertionListError(
                "Assertion failed",
                this,
                payload,
                [...validations.values()],
            );
        }

        return result;
    }
}
