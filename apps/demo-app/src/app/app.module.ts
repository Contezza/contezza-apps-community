import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppConfigService, AuthGuard, CoreModule, DebugAppConfigService, TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { AppService, SharedModule } from '@alfresco/aca-shared';

import { AppExtensionsModule } from './extensions.module';
import { environment } from '../environments/environment';

import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';
import localeDe from '@angular/common/locales/de';
import localeIt from '@angular/common/locales/it';
import localeEs from '@angular/common/locales/es';
import localeJa from '@angular/common/locales/ja';
import localeNl from '@angular/common/locales/nl';
import localePt from '@angular/common/locales/pt';
import localeNb from '@angular/common/locales/nb';
import localeRu from '@angular/common/locales/ru';
import localeCh from '@angular/common/locales/zh';
import localeAr from '@angular/common/locales/ar';
import localeCs from '@angular/common/locales/cs';
import localePl from '@angular/common/locales/pl';
import localeFi from '@angular/common/locales/fi';
import localeDa from '@angular/common/locales/da';
import localeSv from '@angular/common/locales/sv';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { AppComponent } from './app.components';
import { ContentVersionService } from '@alfresco/adf-content-services';
import { STORE_INITIAL_APP_DATA } from '@alfresco/aca-shared/store';
import { SHELL_APP_SERVICE, SHELL_AUTH_TOKEN, ShellModule } from '@alfresco/adf-core/shell';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ContentServiceExtensionModule, ContentUrlService, CoreExtensionsModule, INITIAL_APP_STATE } from '@alfresco/aca-content';
import { APP_ROUTES, shellChildren } from './app.routes';
import { AppLoginModule } from './components/login/login.module';

registerLocaleData(localeFr);
registerLocaleData(localeDe);
registerLocaleData(localeIt);
registerLocaleData(localeEs);
registerLocaleData(localeJa);
registerLocaleData(localeNl);
registerLocaleData(localePt);
registerLocaleData(localeNb);
registerLocaleData(localeRu);
registerLocaleData(localeCh);
registerLocaleData(localeAr);
registerLocaleData(localeCs);
registerLocaleData(localePl);
registerLocaleData(localeFi);
registerLocaleData(localeDa);
registerLocaleData(localeSv);

@NgModule({
    imports: [
        BrowserModule,
        TranslateModule.forRoot(),
        CoreModule.forRoot(),
        SharedModule.forRoot(),
        CoreExtensionsModule.forRoot(),
        AppLoginModule,
        environment.e2e ? NoopAnimationsModule : BrowserAnimationsModule,
        !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 25 }) : [],
        RouterModule.forRoot(APP_ROUTES, {
            useHash: true,
            enableTracing: false, // enable for debug only
            relativeLinkResolution: 'legacy',
        }),
        AppExtensionsModule,
        ShellModule.withRoutes({ shellChildren: [shellChildren()] }),
        ContentServiceExtensionModule,
    ],
    providers: [
        { provide: AppService, useClass: AppService },
        { provide: AppConfigService, useClass: DebugAppConfigService },
        { provide: ContentVersionService, useClass: ContentUrlService },
        {
            provide: SHELL_APP_SERVICE,
            useClass: AppService,
        },
        {
            provide: SHELL_AUTH_TOKEN,
            useClass: AuthGuard,
        },
        {
            provide: STORE_INITIAL_APP_DATA,
            useValue: INITIAL_APP_STATE,
        },
        {
            provide: TRANSLATION_PROVIDER,
            multi: true,
            useValue: {
                name: 'app',
                source: 'assets',
            },
        },
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
