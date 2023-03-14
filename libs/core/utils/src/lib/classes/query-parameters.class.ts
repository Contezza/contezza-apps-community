export interface ContezzaQueryParametersInterface {
    [key: string]: string | number;
}

export class ContezzaQueryParameters {
    constructor(private readonly queryParameters: ContezzaQueryParametersInterface) {}

    toString(): string {
        const queryParametersAsString: string = Object.entries(this.queryParameters)
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        return queryParametersAsString ? '?' + queryParametersAsString : '';
    }

    static fromString(query: string): ContezzaQueryParametersInterface {
        const queryParameters = {};
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
