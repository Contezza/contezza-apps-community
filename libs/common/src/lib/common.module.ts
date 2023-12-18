import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { provideTranslations } from '@alfresco/adf-core';
import { ExtensionService } from '@alfresco/adf-extensions';

import { RouterExtensionService } from '@contezza/core/extensions';
import { RouterStoreModule } from '@contezza/core/stores';
import { DATE_FORMATS } from '@contezza/core/utils';

import { Effects } from './store/effects';

@NgModule({
    imports: [RouterStoreModule, EffectsModule.forFeature([Effects])],
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
        provideTranslations('contezza-common', 'assets/contezza-common'),
        RouterExtensionService.provider,
    ],
})
export class ContezzaCommonModule {
    constructor(extensions: ExtensionService) {
        extensions.setEvaluators({
            'app.selection.single': ({ selection }) => selection?.count === 1,
        });
    }
}
