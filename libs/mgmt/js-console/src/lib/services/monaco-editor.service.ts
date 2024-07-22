import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TernModel, TernToTs } from '../utils/tern-to-ts';
import { NewJsConsoleService } from './js-console.service';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleMonacoEditorService {
    static readonly URL_TYPING = './assets/js-console/defs/alfresco.json';
    API_COMMANDS_URL = '';

    constructor(private readonly http: HttpClient, private readonly jsConsoleService: NewJsConsoleService) {
        this.API_COMMANDS_URL = this.jsConsoleService.apiCommandsUrl();
    }

    getConfig() {
        return {
            baseUrl: './assets',
            defaultOptions: { scrollBeyondLastLine: false, minimap: { enabled: false }, contextmenu: false },
            onMonacoLoad: this.jsConsoleService.onMonacoLoad.bind(this),
        };
    }

    get alfrescoNamespace(): Observable<string> {
        return this.http.get<TernModel>(JsConsoleMonacoEditorService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    }
}
