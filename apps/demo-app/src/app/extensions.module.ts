import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/adf-office-services-ext';

import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';

import { ContezzaCommonModule } from '@contezza/common';
import { ContezzaJsConsoleSharedModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { MatDialogService } from '@contezza/core/dialogs';

@NgModule({
    imports: [
        AosExtensionModule,
        // ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        ContezzaCommonModule,
        ContezzaJsConsoleSharedModule,
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [MatDialogService.provider, provideExtensionConfig(['demo-app-navbar.json', 'dynamicforms.json'])],
})
export class AppExtensionsModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('demo-app', 'assets/demo-app');
    }
}
