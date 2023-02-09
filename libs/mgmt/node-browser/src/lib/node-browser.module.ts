import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { NodeBrowserSearchComponent } from './components/search/node-browser-search.component';
import { NodeBrowserViewComponent } from './components/view/node-browser-view.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { ExtensionsModule } from '@alfresco/adf-extensions';
import { PageLayoutModule } from '@alfresco/aca-shared';
import { IconModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/utils';

import { NodeBrowserStoreModule } from './store/store.module';
import { NodeBrowserTableCellPropertyPipe } from './pipes/table-cell-prop.pipe';
import { NodeBrowserColumnParentPathPipe } from './pipes/column-parent-path.pipe';
import { NodeBrowserColumnPropertyPipe } from './pipes/column-property.pipe';

import { NodeBrowserResultTableComponent } from './components/result-table/result-table.component';
import { NodeBrowserSearchParentColumnComponent } from './components/columns/search-parent-column.component';
import { NodeBrowserSearchLinkColumnComponent } from './components/columns/search-link-column.component';
import { NodeBrowserTextColumnComponent } from './components/columns/browse-text-column.component';
import { NodeBrowserValuesColumnComponent } from './components/columns/browse-values-column.component';
import { NodeBrowserViewItemComponent } from './components/view/view-item/view-item.component';
import { NodeBrowserMaterialModule } from './node-browser-material.module';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: NodeBrowserSearchComponent,
                data: {
                    title: 'APP.NODE_BROWSER.NAVBAR.TITLE',
                },
            },
            {
                path: ':nodeRef',
                component: NodeBrowserViewComponent,
                data: {
                    title: 'APP.NODE_BROWSER.NAVBAR.TITLE',
                },
            },
        ],
    },
];

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        RouterModule.forChild(routes),
        PageLayoutModule,
        FormsModule,
        ReactiveFormsModule,
        IconModule,
        ExtensionsModule,
        ContezzaLetModule,
        NodeBrowserMaterialModule,
        NodeBrowserStoreModule,
    ],
    declarations: [
        NodeBrowserSearchComponent,
        NodeBrowserViewComponent,
        NodeBrowserResultTableComponent,
        NodeBrowserTableCellPropertyPipe,
        NodeBrowserColumnParentPathPipe,
        NodeBrowserColumnPropertyPipe,
        NodeBrowserSearchLinkColumnComponent,
        NodeBrowserSearchParentColumnComponent,
        NodeBrowserTextColumnComponent,
        NodeBrowserValuesColumnComponent,
        NodeBrowserViewItemComponent,
    ],
})
export class ContezzaNodeBrowserModule {}
