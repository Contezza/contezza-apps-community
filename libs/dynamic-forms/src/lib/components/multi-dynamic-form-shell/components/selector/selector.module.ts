import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';

import { CoreModule } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaSelectableDirective } from '@contezza/core/context';

import { SelectorComponent } from './selector.component';
import { ContezzaActivableModule } from '../../directives/activable/activable.module';
import { TableCellComponent } from './components/table-cell/table-cell.component';

@NgModule({
    imports: [CommonModule, MatTableModule, MatSortModule, CoreModule, ContezzaLetModule, ContezzaSelectableDirective, ContezzaActivableModule, TableCellComponent],
    declarations: [SelectorComponent],
    exports: [SelectorComponent],
})
export class SelectorModule {}
