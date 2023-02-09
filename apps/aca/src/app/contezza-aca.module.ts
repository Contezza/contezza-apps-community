import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';

import { ContezzaUtilsModule } from '@contezza/utils';
import { ContezzaJsConsoleExtensionModule } from '@contezza/js-console-extensions';

// import { ContezzaNodeBrowserExtensionModule } from '@contezza/node-browser-extensions';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        ContezzaUtilsModule,
        ContezzaJsConsoleExtensionModule,
        // ContezzaNodeBrowserExtensionModule,
    ],
    providers: [provideExtensionConfig(['contezza-aca-navbar.json'])],
})
export class ContezzaAcaModule {
    constructor(translation: TranslationService, extensions: ExtensionService) {
        translation.addTranslationFolder('contezza-aca', 'assets/contezza-aca');
    }
}
