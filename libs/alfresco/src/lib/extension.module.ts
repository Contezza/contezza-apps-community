import { NgModule } from '@angular/core';

import { provideExtension } from './provide-extension';

@NgModule({
    providers: [provideExtension()],
})
export class ExtensionModule {}

export { ExtensionModule as AlfrescoExtensionModule };
