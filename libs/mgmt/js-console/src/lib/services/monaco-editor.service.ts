import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { TernModel, TernToTs } from '../utils/tern-to-ts';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleMonacoEditorService {
    static readonly URL_TYPING = './assets/js-console/defs/alfresco.json';
    API_COMMANDS_URL = 'ootbee/jsconsole/apicommands';

    constructor(private readonly http: HttpClient) {
        // this.API_COMMANDS_URL = this.jsConsoleService.apiCommandsUrl();
    }

    getConfig() {
        return {
            baseUrl: './assets',
            defaultOptions: { scrollBeyondLastLine: false, minimap: { enabled: false }, contextmenu: false },
            onMonacoLoad: this.onMonacoLoad.bind(this),
        };
    }

    get alfrescoNamespace(): Observable<string> {
        return this.http.get<TernModel>(JsConsoleMonacoEditorService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    }

    onMonacoLoad() {
        this.alfrescoNamespace.subscribe((typing) => {
            (window as any).monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                schemas: [],
            });

            (window as any).monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ lib: ['es5'], allowNonTsExtensions: true });
            (window as any).monaco.languages.typescript.javascriptDefaults.addExtraLib(typing, '*');
        });
    }
}
