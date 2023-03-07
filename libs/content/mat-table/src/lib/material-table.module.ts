import { NgModule } from '@angular/core';

import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';
import { MaterialTableComponent } from './material-table/material-table.component';
import { MatTableModule } from '@angular/material/table';
import { DataTableModule, IconModule, TemplateModule } from '@alfresco/adf-core';
import { ExtensionsModule } from '@alfresco/adf-extensions';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MaterialTableCellPropertyPipe } from './pipes/material-table-cell-property.pipe';
import { ContezzaLetModule } from '@contezza/common';
import { MaterialTableActionsColumnComponent } from './columns/material-table-actions-column.component';
import { MatMenuModule } from '@angular/material/menu';
import { MatButtonModule } from '@angular/material/button';
import { ContezzaMatTableContextActionsDirective } from './directives/contextmenu.directive';

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
