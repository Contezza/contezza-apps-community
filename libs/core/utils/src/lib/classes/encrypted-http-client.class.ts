import { Observable } from 'rxjs';

import { HttpClient } from '../interfaces';
import { BaseHttpClient } from './base-http-client.class';

/**
 * Implementation of `HttpClient` which parses each response using a given decryption function.
 * To be used in combination with API calls whose responses are encrypted.
 */
export class EncryptedHttpClient extends BaseHttpClient implements HttpClient {
    constructor(http: HttpClient, private readonly decrypt: <T>(_: Observable<any>) => Observable<T>) {
        super(http);
    }

    get<T>(url: string): Observable<T> {
        return this.decrypt<T>(super.get(url));
    }

    post<T>(url: string, body: any): Observable<T> {
        return this.decrypt<T>(super.post(url, body));
    }

    put<T>(url: string, body: any): Observable<T> {
        return this.decrypt<T>(super.put(url, body));
    }

    delete<T>(url: string): Observable<T> {
        return this.decrypt<T>(super.delete(url));
    }
}
