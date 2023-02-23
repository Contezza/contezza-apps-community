import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/adf-office-services-ext';
import { AcaAboutModule } from '@alfresco/aca-about';
import { AcaSettingsModule } from '@alfresco/aca-settings';

import { ContezzaUtilsModule } from '@contezza/utils';
import { ContezzaJsConsoleExtensionModule } from '@contezza/js-console-extensions';
import { ContezzaNodeBrowserExtensionModule } from '@contezza/node-browser-extensions';

import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';

import { environment } from '../environments/environment';

@NgModule({
    imports: [
        AosExtensionModule,
        ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        ContezzaUtilsModule,
        ContezzaJsConsoleExtensionModule,
        ContezzaNodeBrowserExtensionModule,
    ],
    providers: [provideExtensionConfig(['demo-app-navbar.json'])],
})
export class AppExtensionsModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('demo-app', 'assets/demo-app');
    }
}
