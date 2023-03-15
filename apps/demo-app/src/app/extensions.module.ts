import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/adf-office-services-ext';
import { AcaAboutModule } from '@alfresco/aca-about';
import { AcaSettingsModule } from '@alfresco/aca-settings';

import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';

import { ContezzaCommonModule } from '@contezza/common';
import { ContezzaJsConsoleSharedModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';

import { environment } from '../environments/environment';

@NgModule({
    imports: [
        AosExtensionModule,
        ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        ContezzaCommonModule,
        ContezzaJsConsoleSharedModule,
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [provideExtensionConfig(['demo-app-navbar.json'])],
})
export class AppExtensionsModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('demo-app', 'assets/demo-app');
    }
}
