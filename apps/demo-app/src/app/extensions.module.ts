import { NgModule } from '@angular/core';

import { provideExtensionConfig } from '@alfresco/adf-extensions';
import { AosExtensionModule } from '@alfresco/aca-content/ms-office';
import { ContentServicesSearchExtensionModule } from '@contezza/content-services/search';
import { CoreModule } from '@alfresco/adf-core';
import { CommonModule } from '@angular/common';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';

@NgModule({
    imports: [
        AosExtensionModule,
        CommonModule,
        CoreModule,
        ContentServicesSearchExtensionModule,
        JsConsoleExtensionModule.withConfig({ path: 'javascript-console' }),
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [provideExtensionConfig(['demo-app.columns.json', 'demo-app.dynamic-forms.json', 'demo-app.navbar.json', 'demo-app.search-table-page-configs.json'])],
})
export class AppExtensionsModule {}
