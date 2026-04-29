import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { provideShare } from './provide-share';
import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [provideShare()],
})
export class ExtensionModule {}

export { ExtensionModule as ContentServicesShareExtensionModule };
