export class JwtUtils {
    static parse(token: string): any {
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
        const { exp } = JwtUtils.parse(token);
        return Date.now() < exp * 1000;
    }

    static isExpired(token: string): boolean {
        return !JwtUtils.isValid(token);
    }
}
