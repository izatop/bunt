import {assert} from "../assert.js";
import {DateConfig} from "./interface.js";

function normalizeLocale(locale: string): string {
    if (/^[a-z]{2}_.+$/.test(locale)) {
        return locale.substr(0, 2);
    }

    return locale;
}

export function getDefaultConfig(): DateConfig {
    const system = Intl.DateTimeFormat().resolvedOptions();
    const timeZone = process.env.TZ ?? process.env.TIMEZONE ?? system.timeZone;
    const locale = normalizeLocale(process.env.LANG ?? process.env.LANGUAGE ?? system.locale);
    const weekBegins = /[0-6]/.test(process.env.DATETIME_WEEK_BEGINS ?? "")
        ? parseInt(process.env.DATETIME_WEEK_BEGINS ?? "1", 10)
        : 1;

    Intl.DateTimeFormat(locale, {...system, timeZone} as Intl.DateTimeFormatOptions);

    return {locale, timeZone, weekBegins};
}

const config: DateConfig = getDefaultConfig();

export function setLocale(locale: string | string[]): void {
    const [supported] = Intl.DateTimeFormat.supportedLocalesOf(locale);
    assert(supported, `Incorrect locale information provided: ${locale}`);
    config.locale = supported;
}

export function setTimeZone(timeZone: string): void {
    config.timeZone = timeZone;
}

export function getLocale(): string {
    return config.locale;
}

export function getTimeZone(): string {
    return config.timeZone;
}

export function getWeekBegins(): number {
    return config.weekBegins;
}
