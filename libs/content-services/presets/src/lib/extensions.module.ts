import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { provideTranslations } from '@alfresco/adf-core';
import { provideExtensionConfig } from '@alfresco/adf-extensions';

import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [
        provideTranslations('content-services/presets', 'assets/content-services/presets'),
        provideExtensionConfig(['content-services.presets.actions.json', 'content-services.presets.dynamic-forms.json']),
    ],
})
export class ExtensionModule {}
