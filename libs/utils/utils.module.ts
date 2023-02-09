import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

import { BaseDialogService, MatDialogService } from './services';

@NgModule({
    providers: [{ provide: BaseDialogService, useClass: MatDialogService }],
})
export class ContezzaUtilsModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('contezza-utils', 'assets/contezza-utils');
    }
}
