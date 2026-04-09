import { NgModule } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

import { TranslateService } from '@ngx-translate/core';

import { EffectsModule } from '@ngrx/effects';
import { Store } from '@ngrx/store';

import { debounceTime, filter, merge, take } from 'rxjs';

import { AppConfigService, AuthenticationService, ContentAuth, TranslationService } from '@alfresco/adf-core';
import { ExtensionService } from '@alfresco/adf-extensions';

import { provideCoreExtension } from '@contezza/core';
import { login, logout } from '@contezza/core/actions';
import { MatDialogService } from '@contezza/core/dialogs';
import { ContezzaExtensionService, RouterExtensionService, RuleService } from '@contezza/core/extensions';
import { NotificationsModule } from '@contezza/core/notifications';
import { RouterStoreModule } from '@contezza/core/stores';
import { DATE_FORMATS } from '@contezza/core/utils';

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
                    dateInput: ['D-M-YYYY', 'DD-MM-YYYY'],
                },
                display: {
                    dateInput: 'DD-MM-YYYY',
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
        RouterExtensionService.provider,
        RuleService.provider,
        { provide: ExtensionService, useClass: ContezzaExtensionService },
        MatDialogService.provider,
        provideCoreExtension(),
    ],
})
export class ContezzaCommonModule {
    constructor(store: Store, auth: AuthenticationService, contentAuth: ContentAuth, app: AppConfigService) {
        app.onLoad.pipe(filter(Boolean), take(1)).subscribe(() => {
            // convert subjects into actions
            // eslint-disable-next-line rxjs-x/no-nested-subscribe
            auth.onLogin.pipe(debounceTime(0)).subscribe(() => store.dispatch(login()));
            merge(auth.onLogout, contentAuth.onLogout)
                .pipe(debounceTime(0))
                // eslint-disable-next-line rxjs-x/no-nested-subscribe
                .subscribe(() => store.dispatch(logout()));
        });
    }
}

// https://support.contezza.nl/issues/34753
TranslationService.prototype.loadTranslation = function (lang: string, fallback?: string) {
    this.translate.getTranslation(lang).subscribe(
        () => {
            // this.translate.use(lang);
            // this.onTranslationChanged(lang);
        },
        () => {
            if (fallback && fallback !== lang) {
                this.loadTranslation(fallback);
            }
        },
    );
};
