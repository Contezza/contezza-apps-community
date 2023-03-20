import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';

import { ContezzaQueryParameters, ContezzaStringTemplate } from '@contezza/core/utils';

import { WebscriptService } from './webscript.service';

/**
 * Facilitates Alfresco `api/people/${username}/preferences`.
 */
@Injectable({ providedIn: 'root' })
export class PreferencesService {
    static readonly ENDPOINT = 'api/people/${username}/preferences';
    static readonly TEMPLATE_ENDPOINT = new ContezzaStringTemplate<{ username: string }>(PreferencesService.ENDPOINT);

    constructor(private readonly webscript: WebscriptService) {}

    get(username: string, property?: string): Observable<Record<string, any>> {
        return this.webscript.get(this.getUrl(username, property));
    }

    post(username: string, body: Record<string, string | null>): Observable<object> {
        return this.webscript.post(this.getUrl(username), body);
    }

    delete(username: string, property?: string): Observable<object> {
        return this.webscript.delete(this.getUrl(username, property));
    }

    private getUrl(username: string, pf?: string): string {
        return PreferencesService.TEMPLATE_ENDPOINT.evaluate({ username }) + (pf ? new ContezzaQueryParameters({ pf }).toString() : '');
    }
}
