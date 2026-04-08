import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { provideExtension } from './provide-extension';
import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [provideExtension()],
})
export class ExtensionModule {}

export { ExtensionModule as AlfrescoRmExtensionModule };
