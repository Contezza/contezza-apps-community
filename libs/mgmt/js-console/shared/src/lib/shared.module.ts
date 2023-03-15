import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { TranslationService } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { canOpenInJavascriptConsole } from './rules';

@NgModule({
    imports: [CommonModule, TranslateModule],
    providers: [provideExtensionConfig(['mgmt-js-console-icons.json'])],
})
export class ContezzaJsConsoleSharedModule {
    constructor(readonly extensions: ExtensionService, readonly translation: TranslationService) {
        translation.addTranslationFolder('js-console', 'assets/js-console');
        extensions.setEvaluators({ 'jsconsole.selection.canOpenInJavascriptConsole': canOpenInJavascriptConsole });
    }
}
