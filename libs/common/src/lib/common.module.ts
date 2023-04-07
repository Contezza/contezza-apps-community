import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

import { RouterStoreModule } from '@contezza/core/stores';
import { DATE_FORMATS } from '@contezza/core/utils';

@NgModule({
    imports: [RouterStoreModule],
    providers: [
        {
            provide: DATE_FORMATS,
            useValue: {
                parse: {
                    dateInput: 'l',
                },
                display: {
                    dateInput: 'L',
                    monthYearLabel: 'MMM YYYY',
                    dateA11yLabel: 'LL',
                    monthYearA11yLabel: 'MMMM YYYY',
                },
            },
        },
    ],
})
export class ContezzaCommonModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('contezza-common', 'assets/contezza-common');
    }
}
