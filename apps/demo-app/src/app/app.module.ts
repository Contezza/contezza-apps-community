import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BrowserAnimationsModule, NoopAnimationsModule } from '@angular/platform-browser/animations';

import { AppService } from '@alfresco/aca-shared';

import { TranslateModule } from '@ngx-translate/core';
import { StoreDevtoolsModule } from '@ngrx/store-devtools';
import { ContentServiceExtensionModule, CoreExtensionsModule } from '@alfresco/aca-content';

import { SHELL_APP_SERVICE, SHELL_AUTH_TOKEN, ShellModule } from '@alfresco/adf-core/shell';

import { APP_LAYOUT_ROUTES, APP_ROUTES } from './app.routes';
import { AppExtensionsModule } from './extensions.module';
import { environment } from '../environments/environment';
import { AppComponent } from './app.component';

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
import { AuthGuard, AuthModule, CoreModule, provideTranslations } from '@alfresco/adf-core';

import { LoginComponent } from './components/login/login.component';

const registerLocales = () => {
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
};

registerLocales();

@NgModule({
    imports: [
        LoginComponent,
        AuthModule.forRoot({ useHash: true }),
        BrowserModule,
        TranslateModule.forRoot(),
        CoreModule.forRoot(),
        CoreExtensionsModule.forRoot(),
        ContentServiceExtensionModule,
        environment.e2e ? NoopAnimationsModule : BrowserAnimationsModule,
        !environment.production ? StoreDevtoolsModule.instrument({ maxAge: 25 }) : [],
        RouterModule.forRoot(APP_ROUTES, {
            useHash: true,
            enableTracing: false, // enable for debug only
        }),
        ShellModule.withRoutes({ shellChildren: [APP_LAYOUT_ROUTES] }),
        AppExtensionsModule,
    ],
    providers: [
        {
            provide: SHELL_APP_SERVICE,
            useClass: AppService,
        },
        { provide: SHELL_AUTH_TOKEN, useValue: AuthGuard },
        provideTranslations('demo-app', 'assets/demo-app'),
    ],
    declarations: [AppComponent],
    bootstrap: [AppComponent],
})
export class AppModule {}
