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

import { ContezzaLetModule } from '@contezza/core/directives';
import { NodeBrowserColumnPropertyPipe, NodeBrowserTableCellPropertyPipe } from '@contezza/node-browser/shared';

import { NodeBrowserStoreModule } from './store/store.module';
import { NodeBrowserMaterialModule } from './node-browser-material.module';
import { NodeBrowserResultTableComponent } from './components/result-table/result-table.component';
import { NodeBrowserViewItemComponent } from './components/view/view-item/view-item.component';

const routes: Routes = [
    {
        path: '',
        children: [
            {
                path: '',
                component: NodeBrowserSearchComponent,
                data: { title: 'APP.NODE_BROWSER.NAVBAR.TITLE' },
            },
            {
                path: ':nodeRef',
                component: NodeBrowserViewComponent,
                data: { title: 'APP.NODE_BROWSER.NAVBAR.TITLE' },
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
        NodeBrowserColumnPropertyPipe,
        NodeBrowserTableCellPropertyPipe,
    ],
    declarations: [NodeBrowserSearchComponent, NodeBrowserViewComponent, NodeBrowserResultTableComponent, NodeBrowserViewItemComponent],
})
export class ContezzaNodeBrowserModule {}
