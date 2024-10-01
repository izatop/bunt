import {isObject} from "@bunt/is";
import {XDateConfig} from "./interface.js";

function getWeekBeginsInit(locale: string): number {
    const lc = new Intl.Locale(locale);

    if ("weekInfo" in lc && isObject(lc.weekInfo)) {
        return Number(lc.weekInfo.firstDay);
    }

    return 1;
}

export function getDefaultConfig(options: Partial<XDateConfig> = {}): XDateConfig {
    const {locale, timeZone} = Intl.DateTimeFormat(options.locale, {timeZone: options.timeZone}).resolvedOptions();
    const weekBegins = getWeekBeginsInit(locale);

    return {locale, timeZone, weekBegins};
}

const config: XDateConfig = getDefaultConfig();

export function setLocale(nextLocal: string | string[]): void {
    const [locale] = Intl.DateTimeFormat.supportedLocalesOf(nextLocal);
    Object.assign(config, getDefaultConfig({...config, locale}));
}

export function setTimeZone(timeZone: string): void {
    Object.assign(config, getDefaultConfig({...config, timeZone}));
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
