import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { WebscriptService } from './webscript.service';

/**
 * Facilitates Alfresco `api/people/${username}/preferences`.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
    // TODO: add types

    constructor(private readonly webscript: WebscriptService) {}

    getAll(username: string): Observable<any> {
        return this.webscript.get(`api/people/${username}/preferences`);
    }

    get(username: string, property?: string): Observable<any> {
        return this.webscript.get(this.getUrl(username).concat(property ? `?pf=${property}` : ''));
    }

    post(username: string, body: any): Observable<any> {
        return this.webscript.post(this.getUrl(username), body);
    }

    delete(username: string, property: string): Observable<any> {
        return this.webscript.delete(`${this.getUrl(username)}?pf=${property}`);
    }

    private getUrl(username: string): string {
        return `api/people/${username}/preferences`;
    }
}
