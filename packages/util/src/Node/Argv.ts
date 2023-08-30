import {assert} from "../assert.js";
import {isDefined, isNumber} from "@bunt/is";
import {entriesReverse} from "../object.js";

const OPTION_REGEX = /^--([a-z0-9_-]+)=(.+)$/i;
const FLAG_ON_REGEX = /^-([a-z0-9]+)$/i;
const FLAG_OFF_REGEX = /^!-([a-z0-9]+)$/i;

export type ArgvParse = {
    args: Set<string>;
    options: Map<string, string>;
    flags: Map<string, boolean>;
};

export class Argv {
    public readonly argv: string[];
    public readonly args: Set<string>;
    public readonly options: Map<string, string>;
    public readonly flags: Map<string, boolean>;

    constructor(input: string[]) {
        const {flags, args, options} = this.parse(input);
        this.flags = flags;
        this.args = args;
        this.options = options;
        this.argv = input;
    }

    public toObject(): Record<string, string | boolean> {
        const entries: [string, boolean | string][] = [
            ...this.flags.entries(),
            ...this.options.entries(),
        ];

        return entriesReverse(entries);
    }

    public getFlag(name: string, defaultValue = false): boolean {
        return this.flags.get(name) || defaultValue;
    }

    public getOption(name: string): string | undefined;

    public getOption<T extends string | number>(name: string, defaultValue: T): T;

    public getOption(name: string, defaultValue?: string | number): string | number | undefined {
        const value = this.options.get(name);
        if (isDefined(value) && isNumber(defaultValue)) {
            return parseInt(value, 10);
        }

        return value || defaultValue;
    }

    public getArgs(): string[] {
        return [...this.args.values()];
    }

    protected parse(input: string[]): ArgvParse {
        const flags = new Map<string, boolean>();
        const options = new Map<string, string>();
        const args = new Set<string>();
        for (const item of input) {
            if (FLAG_ON_REGEX.test(item)) {
                flags.set(this.getMatch(item, FLAG_ON_REGEX), true);
                continue;
            }

            if (FLAG_OFF_REGEX.test(item)) {
                flags.set(this.getMatch(item, FLAG_OFF_REGEX), false);
                continue;
            }

            if (OPTION_REGEX.test(item)) {
                options.set(this.getMatch(item, OPTION_REGEX), this.getMatch(item, OPTION_REGEX, 2));
                continue;
            }

            args.add(item);
        }

        return {
            flags,
            options,
            args,
        };
    }

    protected getMatch(value: string, re: RegExp, index = 1): string {
        const res = value.match(re);
        assert(res && res[index]);

        return res[index];
    }
}
