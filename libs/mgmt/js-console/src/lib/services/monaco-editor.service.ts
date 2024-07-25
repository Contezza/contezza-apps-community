import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleMonacoEditorService {
    constructor() {}

    // getConfig() {
    //     return {
    //         baseUrl: './assets',
    //         defaultOptions: { scrollBeyondLastLine: false, minimap: { enabled: false }, contextmenu: false },
    //         onMonacoLoad: this.onMonacoLoad.bind(this),
    //     };
    // }
    //
    // get alfrescoNamespace(): Observable<string> {
    //     return this.http.get<TernModel>(JsConsoleMonacoEditorService.URL_TYPING).pipe(map((json) => TernToTs.adapt(json)));
    // }
}
