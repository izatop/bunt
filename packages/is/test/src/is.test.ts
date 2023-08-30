import {
    isArray,
    isArrowFunction,
    isBoolean,
    isNotNullish,
    isNullish,
    isClass,
    isDefined,
    isFunction,
    isInstanceOf,
    isNull,
    isNumber,
    isObject,
    isString,
    isUndefined,
} from "../../src";

describe("is", () => {
    class Foo {v = 1;}

    class Bar extends Foo {c = 2;}

    const nullValue = null;
    const numberValue = 1;
    const objectValue = {};
    const NaNValue = NaN;
    const undefinedValue = undefined;
    const functionValue = function test(): null {return null;};
    const arrowFunctionValue = () => void 0;
    const stringValue = "hello";
    const booleanValue1 = true;
    const booleanValue2 = false;
    const dateValue = new Date();
    const classValue = Foo;
    const childClassValue = Bar;
    const arrayValue = [1, 2, 3];
    const instanceValue = new childClassValue();

    const types = [
        nullValue,
        numberValue,
        objectValue,
        NaNValue,
        undefinedValue,
        functionValue,
        arrowFunctionValue,
        stringValue,
        dateValue,
        classValue,
        childClassValue,
        booleanValue1,
        booleanValue2,
        arrayValue,
        instanceValue,
    ];

    const make = (skip: (v: any) => boolean) => {
        const negative = types.filter((testValue) => !skip(testValue));
        const positive = types.filter(skip);

        return [
            ...negative.map((testValue) => [testValue, false]),
            ...positive.map((testValue) => [testValue, true]),
        ];
    };

    test.each(make((v) => v === nullValue))(
        "isNull(%s): %s", (a, b) => {
            expect(isNull(a)).toBe(b);
        },
    );

    test.each(make((v) => v === numberValue))(
        "isNumber(%s): %s", (a, b) => {
            expect(isNumber(a)).toBe(b);
        },
    );

    test.each(make((v) => typeof v === "boolean"))(
        "isBoolean(%s): %s", (a, b) => {
            expect(isBoolean(a)).toBe(b);
        },
    );

    test.each(make((v) => typeof v === "undefined"))(
        "isUndefined(%s): %s", (a, b) => {
            expect(isUndefined(a)).toBe(b);
        },
    );

    test.each(make((v) => isNull(v) || isUndefined(v)))(
        "isNullish(%s): %s", (a, b) => {
            expect(isNullish(a)).toBe(b);
        },
    );

    test.each(make((v) => !isNullish(v)))(
        "isNotNullish(%s): %s", (a, b) => {
            expect(isNotNullish(a)).toBe(b);
        },
    );

    test.each(make((v) => v === stringValue))(
        "isString(%s): %s", (a, b) => {
            expect(isString(a)).toBe(b);
        },
    );

    test.each(make((v) => v === arrayValue))(
        "isArray(%s): %s", (a, b) => {
            expect(isArray(a)).toBe(b);
        },
    );

    test.each(make((v) => v !== undefinedValue))(
        "isDefined(%s): %s", (a, b) => {
            expect(isDefined(a)).toBe(b);
        },
    );

    test.each(make((v) => [functionValue, arrowFunctionValue].includes(v)))(
        "isFunction(%s): %s", (a, b) => {
            expect(isFunction(a)).toBe(b);
        },
    );

    test.each(make((v) => v === arrowFunctionValue))(
        "isArrowFunction(%s): %s", (a, b) => {
            expect(isArrowFunction(a)).toBe(b);
        },
    );

    test.each(make((v) => v === classValue || v === childClassValue))(
        "isClass(%s): %s", (a, b) => {
            expect(isClass(a)).toBe(b);
        },
    );

    test.each(make((v) => v === objectValue || v === dateValue || v === instanceValue))(
        "isObject(%s): %s", (a, b) => {
            expect(isObject(a)).toBe(b);
        },
    );

    test.each(make((v) => v === instanceValue))(
        "isInstanceOf(%s): %s", (a, b) => {
            expect(isInstanceOf(a, Foo)).toBe(b);
            expect(isInstanceOf(a, Bar)).toBe(b);
            if (isInstanceOf(a, Bar)) {
                expect(a.v).toBe(1);
                expect(a.c).toBe(2);
            }

            if (isInstanceOf(a, Foo)) {
                expect(a.v).toBe(1);
            }
        },
    );
});
