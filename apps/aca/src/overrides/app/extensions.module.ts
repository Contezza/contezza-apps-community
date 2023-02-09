import { NgModule } from '@angular/core';

import { AosExtensionModule } from '@alfresco/content-ce/office-services';
import { AcaAboutModule } from '@alfresco/content-ce/about';
import { AcaSettingsModule } from '@alfresco/content-ce/settings';
import { AcaFolderRulesModule } from '@alfresco/aca-folder-rules';

import { environment } from '../environments/environment';

import { ContezzaAcaModule } from '@contezza/aca';

@NgModule({
    imports: [
        AosExtensionModule,
        AcaFolderRulesModule,
        ...(environment.devTools ? [AcaAboutModule.forRoot(environment.production), AcaSettingsModule] : []),
        AcaAboutModule,
        ContezzaAcaModule
    ],
})
export class AppExtensionsModule {
}
