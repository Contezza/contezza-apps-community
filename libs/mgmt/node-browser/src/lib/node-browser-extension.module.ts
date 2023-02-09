import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';
import { ExtensionService, provideExtensionConfig } from '@alfresco/adf-extensions';

import { NodeBrowserSearchParentColumnComponent } from './components/columns/search-parent-column.component';
import { NodeBrowserSearchLinkColumnComponent } from './components/columns/search-link-column.component';
import { NodeBrowserTextColumnComponent } from './components/columns/browse-text-column.component';
import { NodeBrowserValuesColumnComponent } from './components/columns/browse-values-column.component';
import { CommonModule } from "@angular/common";

@NgModule({
    imports: [CommonModule],
    providers: [provideExtensionConfig(['mgmt.node-browser.icons.json', 'mgmt.node-browser.columns.json', 'mgmt.node-browser.view-items.json'])],
})
export class ContezzaNodeBrowserExtensionModule {
    constructor(readonly extensions: ExtensionService, readonly translation: TranslationService) {
        translation.addTranslationFolder('mgmt/node-browser', 'assets/mgmt/node-browser');
        extensions.setComponents({
            'node-browser.search.parent.column.component': NodeBrowserSearchParentColumnComponent,
            'node-browser.link.column.component': NodeBrowserSearchLinkColumnComponent,
            'node-browser.text.column.component': NodeBrowserTextColumnComponent,
            'node-browser.values.column.component': NodeBrowserValuesColumnComponent,
        });
    }
}
