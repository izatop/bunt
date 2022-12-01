const isNumeric = (key: string): boolean => !isNaN(+key);

export class QueryString {
    public static parseFieldName = (name: string): string[] => {
        const base = name.replace(/\[.+/, "");

        return [base, ...[...name.matchAll(/\[([^\]]*)\]/ig)].map(([, key]) => key)];
    };

    public static inject = ([key, ...paths]: string[], value: unknown, fields: any = {}): any => {
        if (paths.length > 0) {
            fields[key] = this.inject(paths, value, fields[key]);
        } else {
            fields[key] = value;
        }

        if (isNumeric(key)) {
            return Object.values(fields);
        }

        return fields;
    };
}
