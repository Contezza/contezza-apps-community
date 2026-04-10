import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/aca-content/ms-office';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { CoreExtensionModule } from '@contezza/core';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService } from '@contezza/core/extensions';
import { PropertyTitleService } from '@contezza/core/property-titles';
import { ResponsiveModule } from '@contezza/core/responsive';

import { AlfrescoExtensionModule } from '@contezza/alfresco';
import { AlfrescoRmExtensionModule } from '@contezza/alfresco/rm';
import { ContentServicesSearchExtensionModule } from '@contezza/content-services/search';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { LayoutExtensionModule } from '@contezza/layout';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { ProcessServicesExtensionModule } from '@contezza/process-services';
import { ProfileExtensionModule } from '@contezza/profile';

@NgModule({
    imports: [
        CoreExtensionModule,
        LayoutExtensionModule,
        AosExtensionModule,
        ContentServicesSearchExtensionModule,
        ProfileExtensionModule,
        AlfrescoExtensionModule,
        AlfrescoRmExtensionModule,
        ProcessServicesExtensionModule,
        JsConsoleExtensionModule.withConfig({ path: 'javascript-console' }),
        ContezzaNodeBrowserSharedModule,
        ResponsiveModule,
    ],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideExtensionConfig(['demo-app.columns.json', 'demo-app.dynamic-forms.json', 'demo-app.navbar.json', 'demo-app.search-table-page-configs.json']),
        PropertyTitleService.provideKeyPropertyMapping(key => (key.startsWith('ALFRESCO.') ? key.slice('ALFRESCO.'.length) : undefined)),
    ],
})
export class AppExtensionsModule {}
