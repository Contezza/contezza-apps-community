export class ContezzaQueryParameters<T> {
    constructor(private readonly queryParameters: T & Partial<Record<keyof T, string | number | boolean>>) {}

    toString(): string {
        const queryParametersAsString: string = Object.entries(this.queryParameters)
            .filter(([, value]) => value !== null && value !== undefined)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        return queryParametersAsString ? '?' + queryParametersAsString : '';
    }

    static fromString(query: string): Record<string, string> {
        const queryParameters: Record<string, string> = {};
        query
            ?.split('&')
            .filter((value) => value.includes('='))
            .forEach((queryParam) => {
                const [key, value] = queryParam.split('=');
                queryParameters[key] = value;
            });
        return queryParameters;
    }
}
