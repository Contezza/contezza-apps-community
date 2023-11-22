import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/adf-office-services-ext';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { TranslationService } from '@alfresco/adf-core';

import { ContezzaCommonModule } from '@contezza/common';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService } from '@contezza/core/extensions';

import { Config } from './config';

@NgModule({
    imports: [
        AosExtensionModule,
        // ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        ContezzaCommonModule,
        JsConsoleExtensionModule.withConfig({ path: Config.Urls.JsConsole }),
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideExtensionConfig(['demo-app-navbar.json', 'dynamicforms.json']),
    ],
})
export class AppExtensionsModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('demo-app', 'assets/demo-app');
    }
}
