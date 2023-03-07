import { Observable } from 'rxjs';

export interface HttpClient {
    get<T>(url: string): Observable<T>;
    post<T>(url: string, body: any): Observable<T>;
    put<T>(url: string, body: any): Observable<T>;
    delete<T>(url: string): Observable<T>;
}
