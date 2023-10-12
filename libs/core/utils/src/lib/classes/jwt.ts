/**
 * Implements a JWT (JSON Web Token). Supports decoding and validation.
 */
export class Jwt<T = any> {
    private _parsedToken: T & { exp: number };

    constructor(private readonly _token: string) {}

    decode(): T & { exp: number } {
        return (this._parsedToken ??= Jwt.decode(this._token));
    }

    /**
     * Validates the token against its expiration date.
     */
    isValid(): boolean {
        return !this.isExpired();
    }

    /**
     * Checks whether the token expiration date has already passed.
     */
    isExpired(): boolean {
        const { exp } = this.decode();
        return Date.now() >= exp * 1000;
    }

    /**
     * Decodes a JWT token.
     *
     * @param token A JWT token
     * @returns The decoded token
     */
    static decode<T>(token: string): T & { exp: number } {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        return JSON.parse(jsonPayload);
    }
}
