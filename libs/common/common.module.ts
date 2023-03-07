import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

import { BaseDialogService, MatDialogService } from './services';

@NgModule({
    providers: [{ provide: BaseDialogService, useClass: MatDialogService }],
})
export class ContezzaCommonModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('contezza-common', 'assets/contezza-common');
    }
}
