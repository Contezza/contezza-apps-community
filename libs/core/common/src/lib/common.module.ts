import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

import { RouterStoreModule } from '@contezza/core/stores';

@NgModule({
    imports: [RouterStoreModule],
})
export class ContezzaCommonModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('contezza-common', 'assets/contezza-common');
    }
}
