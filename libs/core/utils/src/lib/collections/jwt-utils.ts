/**
 * @deprecated
 * Use class Jwt instead.
 */
export class JwtUtils {
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

    static isValid(token: string): boolean {
        const { exp } = JwtUtils.decode(token);
        return Date.now() < exp * 1000;
    }

    static isExpired(token: string): boolean {
        return !JwtUtils.isValid(token);
    }
}
