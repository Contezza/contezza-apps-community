import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { forkJoin, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { WebscriptService } from '@contezza/utils';

import { alfrescoAutocomplete, alfrescoSnippets } from '../utils/alfresco.autocomplete';
import { TernModel, TernToTs } from '../utils/tern-to-ts';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleMonacoEditorService {
    static readonly URL_TYPING = './assets/mgmt/js-console/defs/alfresco.json';
    private readonly API_COMMANDS_URL = 'de/fme/jsconsole/apicommands';

    constructor(private readonly http: HttpClient, private readonly webscript: WebscriptService) {}

    getConfig() {
        return {
            baseUrl: './assets',
            defaultOptions: { scrollBeyondLastLine: false, minimap: { enabled: false }, contextmenu: false },
            onMonacoLoad: this.onMonacoLoad.bind(this),
        };
    }

    private onMonacoLoad() {
        forkJoin([this.webscript.get(this.API_COMMANDS_URL), this.alfrescoNamespace]).subscribe(([commands, typing]) => {
            (window as any).monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
                validate: true,
                enableSchemaRequest: true,
                schemas: [],
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['.'],
                provideCompletionItems(model, position) {
                    const textUntilPosition = model.getValueInRange({
                        startLineNumber: position.lineNumber,
                        startColumn: 1,
                        endLineNumber: position.lineNumber,
                        endColumn: position.column,
                    });

                    return {
                        suggestions: alfrescoAutocomplete((<any>window).monaco, textUntilPosition, commands.methods) ?? [],
                    };
                },
            });

            (window as any).monaco.languages.registerCompletionItemProvider('javascript', {
                triggerCharacters: ['(', ',', ' '],
                provideCompletionItems: () => ({
                    suggestions: alfrescoSnippets((<any>window).monaco, commands),
                }),
            });

            (window as any).monaco.languages.typescript.javascriptDefaults.setCompilerOptions({ lib: ['es5'], allowNonTsExtensions: true });
            (window as any).monaco.languages.typescript.javascriptDefaults.addExtraLib(typing, '*');
        });
    }

    private get alfrescoNamespace(): Observable<string> {
        return this.http.get<TernModel>(JsConsoleMonacoEditorService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    }
}
