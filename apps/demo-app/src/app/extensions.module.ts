import { NgModule } from '@angular/core';

import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';
import { AosExtensionModule } from '@alfresco/aca-content/ms-office';

import { ContezzaCommonModule } from '@contezza/common';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService } from '@contezza/core/extensions';
import { ContentServicesSearchExtensionModule } from '@contezza/content-services/search';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';

import { Config } from './config';

@NgModule({
    imports: [
        ContezzaCommonModule,
        AosExtensionModule,
        ContentServicesSearchExtensionModule,
        JsConsoleExtensionModule.withConfig({ path: Config.Urls.JsConsole }),
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideExtensionConfig(['demo-app.columns.json', 'demo-app.dynamic-forms.json', 'demo-app.navbar.json', 'demo-app.search-table-page-configs.json']),
    ],
})
export class AppExtensionsModule {}
