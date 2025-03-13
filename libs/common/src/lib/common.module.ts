import { NgModule } from '@angular/core';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { TranslateService } from '@ngx-translate/core';

import { EffectsModule } from '@ngrx/effects';

import { provideTranslations } from '@alfresco/adf-core';

import { RouterExtensionService, RuleService } from '@contezza/core/extensions';
import { NotificationsModule } from '@contezza/core/notifications';
import { RouterStoreModule } from '@contezza/core/stores';
import { DATE_FORMATS } from '@contezza/core/utils';

import { ExtensionLoaderService } from './services/extension-loader.service';
import { Effects } from './store/effects';
import { getPaginatorIntl } from './utils/get-paginator-intl';

@NgModule({
    imports: [NotificationsModule, RouterStoreModule, EffectsModule.forFeature([Effects])],
    providers: [
        {
            provide: MatPaginatorIntl,
            useFactory: (translate: TranslateService) => getPaginatorIntl(translate),
            deps: [TranslateService],
        },
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
        {
            provide: MAT_MOMENT_DATE_ADAPTER_OPTIONS,
            useValue: { strict: true },
        },
        provideTranslations('contezza-common', 'assets/contezza-common'),
        RouterExtensionService.provider,
        RuleService.provider,
    ],
})
export class ContezzaCommonModule {
    constructor(extensions: ExtensionLoaderService) {
        extensions.loadDefaults();
    }
}
