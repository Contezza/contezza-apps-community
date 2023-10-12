import { JwtUtils } from '../collections';

export class Jwt {
    private _parsedToken: any;

    constructor(private readonly _token: string) {}

    parse(): any {
        return (this._parsedToken ??= JwtUtils.parse(this._token));
    }

    isValid(): boolean {
        const { exp } = this.parse();
        return Date.now() < exp * 1000;
    }

    isExpired(): boolean {
        return !this.isValid();
    }
}
