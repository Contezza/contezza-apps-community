import { NgModule } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { DataTableModule, IconModule, TemplateModule } from '@alfresco/adf-core';
import { ExtensionsModule } from '@alfresco/adf-extensions';

import { ContezzaLetModule } from '@contezza/utils';

import { MaterialTableCellPropertyPipe } from './pipes/material-table-cell-property.pipe';
import { MaterialTableActionsColumnComponent } from './columns/material-table-actions-column.component';
import { ContezzaMatTableContextActionsDirective } from './directives/contextmenu.directive';
import { MaterialTableComponent } from './material-table/material-table.component';

@NgModule({
    imports: [
        CommonModule,
        TranslateModule,
        MatTableModule,
        MatButtonModule,
        MatMenuModule,
        MatPaginatorModule,
        MatProgressSpinnerModule,
        IconModule,
        ExtensionsModule,
        DataTableModule,
        TemplateModule,
        ContezzaLetModule,
    ],
    declarations: [MaterialTableComponent, MaterialTableActionsColumnComponent, MaterialTableCellPropertyPipe, ContezzaMatTableContextActionsDirective],
    exports: [MaterialTableComponent, ContezzaMatTableContextActionsDirective],
})
export class ContezzaMaterialTableModule {}
