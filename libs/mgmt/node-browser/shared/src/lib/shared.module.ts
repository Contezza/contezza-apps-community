import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslationService } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

@NgModule({
    imports: [CommonModule],
    providers: [provideExtensionConfig(['mgmt.node-browser.icons.json', 'mgmt.node-browser.columns.json', 'mgmt.node-browser.view-items.json'])],
})
export class ContezzaNodeBrowserSharedModule {
    constructor(readonly extensions: ExtensionService, readonly translation: TranslationService) {
        translation.addTranslationFolder('node-browser', 'assets/node-browser');

        import('./columns/search-parent-column.component')
            .then((c) => c.NodeBrowserSearchParentColumnComponent)
            .then((cp) => extensions.setComponents({ 'node-browser.search.parent.column.component': cp }));
        import('./columns/search-link-column.component')
            .then((c) => c.NodeBrowserSearchLinkColumnComponent)
            .then((cp) => extensions.setComponents({ 'node-browser.link.column.component': cp }));
        import('./columns/browse-text-column.component')
            .then((c) => c.NodeBrowserTextColumnComponent)
            .then((cp) => extensions.setComponents({ 'node-browser.text.column.component': cp }));
        import('./columns/browse-values-column.component')
            .then((c) => c.NodeBrowserValuesColumnComponent)
            .then((cp) => extensions.setComponents({ 'node-browser.values.column.component': cp }));
    }
}
