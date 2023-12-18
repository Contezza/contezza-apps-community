import { NgModule } from '@angular/core';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';

import { ContezzaCommonModule } from '@contezza/common';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService, RouterExtensionService } from '@contezza/core/extensions';

import { Config } from './config';

@NgModule({
    imports: [ContezzaCommonModule, JsConsoleExtensionModule.withConfig({ path: Config.Urls.JsConsole }), ContezzaNodeBrowserSharedModule],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideTranslations('demo-app', 'assets/demo-app'),
        provideExtensionConfig(['demo-app-navbar.json', 'dynamicforms.json']),
    ],
})
export class AppExtensionsModule {
    constructor(router: RouterExtensionService) {
        router.setLoadChildren({ 'js-console': () => import('@contezza/js-console').then((m) => m.JsConsoleModule) });
    }
}
