import { NgModule } from '@angular/core';

import { SHELL_NAVBAR_MIN_WIDTH } from '@alfresco/adf-core/shell';
import { ExtensionService } from '@alfresco/adf-extensions';

@NgModule({
    providers: [{ provide: SHELL_NAVBAR_MIN_WIDTH, useValue: 70 }],
})
export class ExtensionModule {
    constructor(extensions: ExtensionService) {
        import('@contezza/layout/components/header').then(c =>
            extensions.setComponents({
                'app.layout.header': c.HeaderComponent,
            }),
        );
        import('@contezza/layout/components/sidenav').then(c =>
            extensions.setComponents({
                'app.layout.sidenav': c.SidenavComponent,
            }),
        );
    }
}

export { ExtensionModule as LayoutExtensionModule };
