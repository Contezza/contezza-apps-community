import { Observable } from 'rxjs';

import { HttpClient } from '../interfaces';

/**
 * Straightforward `HttpClient` implementation.
 */
export class BaseHttpClient implements HttpClient {
    constructor(protected readonly http: HttpClient) {}

    get<T>(url: string): Observable<T> {
        return this.http.get(url);
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.http.post(url, body);
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.http.put(url, body);
    }

    delete<T>(url: string): Observable<T> {
        return this.http.delete(url);
    }
}
