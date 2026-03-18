import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/aca-content/ms-office';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { ContezzaCommonModule } from '@contezza/common';
import { ContentServicesSearchExtensionModule } from '@contezza/content-services/search';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService } from '@contezza/core/extensions';
import { PropertyTitleService } from '@contezza/core/property-titles';
import { JsConsoleExtensionModule } from '@contezza/js-console/shared';
import { ContezzaNodeBrowserSharedModule } from '@contezza/node-browser/shared';
import { ProcessServicesExtensionModule } from '@contezza/process-services';
import { ProfileExtensionModule } from '@contezza/profile';

@NgModule({
    imports: [
        ContezzaCommonModule,
        AosExtensionModule,
        ContentServicesSearchExtensionModule,
        ProfileExtensionModule,
        ProcessServicesExtensionModule,
        JsConsoleExtensionModule.withConfig({ path: 'javascript-console' }),
        ContezzaNodeBrowserSharedModule,
    ],
    providers: [
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideExtensionConfig(['demo-app.columns.json', 'demo-app.dynamic-forms.json', 'demo-app.navbar.json', 'demo-app.search-table-page-configs.json']),
        PropertyTitleService.provideKeyPropertyMapping(key => (key.startsWith('ALFRESCO.') ? key.slice('ALFRESCO.'.length) : undefined)),
    ],
})
export class AppExtensionsModule {}
