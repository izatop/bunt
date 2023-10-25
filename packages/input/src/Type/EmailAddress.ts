import {isString} from "@bunt/is";
import {ScalarType} from "./ScalarType.js";

// eslint-disable-next-line
export const RE_EMAIL_RFC5222 = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
export const RE_EMAIL_UNI = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~\p{L}\p{N}\p{M}.-]+@[\p{L}\p{N}\p{M}.-]+$/u;

export class EmailAddressType extends ScalarType<string> {
    constructor(regex: RegExp) {
        super({
            name: "EmailAddress",
            validate(payload): string {
                this.assert(isString(payload), `Wrong payload: ${this.name} expected`, payload);
                this.assert(regex.test(payload), `Wrong payload: ${this.name} expected`, payload);

                return payload;
            },
        });
    }
}

export const EmailAddress = new EmailAddressType(RE_EMAIL_RFC5222);
export const EmailAddressRFC5222 = new EmailAddressType(RE_EMAIL_RFC5222);
export const EmailAddressUnicode = new EmailAddressType(RE_EMAIL_UNI);
