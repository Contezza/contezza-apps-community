import { ModuleWithProviders, NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { TRANSLATION_PROVIDER } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { NgUtils } from '@contezza/core/utils';

import { Effects } from './store/effects';
import { EXTENSION_CONFIG, ExtensionConfig } from './models';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [
        { provide: TRANSLATION_PROVIDER, multi: true, useValue: { name: 'js-console', source: 'assets/js-console' } },
        provideExtensionConfig(['js-console.actions.json', 'js-console.icons.json']),
    ],
})
export class JsConsoleExtensionModule {
    static withConfig(config: ExtensionConfig): ModuleWithProviders<JsConsoleExtensionModule> {
        return NgUtils.getModuleWithConfig(JsConsoleExtensionModule, EXTENSION_CONFIG, config);
    }
}
