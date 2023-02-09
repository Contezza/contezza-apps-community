import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '@alfresco/adf-core';

import { SearchFormComponent } from './search-form.component';

@NgModule({
    imports: [CommonModule, CoreModule],
    declarations: [SearchFormComponent],
    exports: [SearchFormComponent],
})
export class ContezzaSearchFormModule {}
