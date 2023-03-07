export class ContezzaJwtUtils {
    static isValid(token: string): boolean {
        const base64Url = token.split('.')[1];
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );
        const { exp } = JSON.parse(jsonPayload);
        return Date.now() < exp * 1000;
    }

    static isExpired(token: string): boolean {
        return !ContezzaJwtUtils.isValid(token);
    }
}
