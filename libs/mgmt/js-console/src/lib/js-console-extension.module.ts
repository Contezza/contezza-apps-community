import { NgModule } from '@angular/core';

import { TranslateModule } from '@ngx-translate/core';

import { TranslationService } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { canOpenInJavascriptConsole } from './rules/rules';
import { JsConsoleStoreModule } from './store/store.module';

@NgModule({
    imports: [JsConsoleStoreModule, TranslateModule],
    providers: [provideExtensionConfig(['mgmt-js-console-icons.json'])],
})
export class ContezzaJsConsoleExtensionModule {
    constructor(readonly extensions: ExtensionService, readonly translation: TranslationService) {
        translation.addTranslationFolder('mgmt/js-console', 'assets/mgmt/js-console');
        extensions.setEvaluators({ 'jsconsole.selection.canOpenInJavascriptConsole': canOpenInJavascriptConsole });
    }
}
