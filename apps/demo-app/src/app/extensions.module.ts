import { NgModule } from '@angular/core';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { provideTranslations } from '@alfresco/adf-core';

import { ContezzaCommonModule } from '@contezza/common';
import { JsConsoleExtensionModule, ServiceKey } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService, RouterExtensionService } from '@contezza/core/extensions';
import { PropertyTitleService } from '@contezza/core/property-titles';

import { Config } from './config';

let serviceKey;
const mapper = {};

const config = window['config'];

// this does not work:
// const extras = config?.modules?.map((key) => mapper[key]) || [];
// this is literally the same, but it works:
const extraImports = [];
config?.modules?.forEach((key) => extraImports.push(mapper[key]));

const extraExtensionJsons = config?.extensionJsons || [];

const jsConsole = config?.jsConsole;

console.log('Hallo');
console.log(config);
console.log(extraExtensionJsons);
console.log(jsConsole);
console.log(jsConsole.service);
if (jsConsole === 'legacy') {
    serviceKey = ServiceKey.LEGACY;
} else if (jsConsole === 'ootb') {
    serviceKey = ServiceKey.OOTB;
}

@NgModule({
    imports: [ContezzaCommonModule, JsConsoleExtensionModule.withConfig({ path: Config.Urls.JsConsole, service: serviceKey }), ContezzaNodeBrowserSharedModule],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideTranslations('demo-app', 'assets/demo-app'),
        provideExtensionConfig(['demo-app-navbar.json', 'dynamicforms.json', ...extraExtensionJsons]),
        PropertyTitleService.provideKeyPropertyMapping((key) => (key.startsWith('ALFRESCO.') ? key.slice('ALFRESCO.'.length) : undefined)),
    ],
})
export class AppExtensionsModule {
    constructor(router: RouterExtensionService) {
        router.setLoadChildren({ 'js-console': () => import('@contezza/js-console').then((m) => m.JsConsoleModule) });
    }
}
