import { ModuleWithProviders, NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { Effects } from './store/effects';
import { Config, ConfigService } from './config.service';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [
        { provide: TRANSLATION_PROVIDER, multi: true, useValue: { name: 'js-console', source: 'assets/js-console' } },
        provideExtensionConfig(['js-console.actions.json', 'js-console.icons.json']),
    ],
})
export class JsConsoleExtensionModule {
    static withConfig(config: Config): ModuleWithProviders<JsConsoleExtensionModule> {
        return {
            ngModule: JsConsoleExtensionModule,
            providers: [ConfigService.provide(config)],
        };
    }
}
