import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedToolbarModule } from '@alfresco/aca-shared';

import { ContezzaToggleFilterComponent } from './toggle-filter.component';

@NgModule({
    imports: [CommonModule, SharedToolbarModule],
    declarations: [ContezzaToggleFilterComponent],
    exports: [ContezzaToggleFilterComponent],
})
export class ContezzaToggleFilterModule {}
