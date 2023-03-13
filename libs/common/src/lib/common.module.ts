import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

@NgModule()
export class ContezzaCommonModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('contezza-common', 'assets/contezza-common');
    }
}
