import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { CoreModule } from '@alfresco/adf-core';

import { SearchFormComponent } from './components/search-form/search-form.component';

import { ContezzaSearchFormModule } from './components/search-form/search-form.module';

@NgModule({
    imports: [CommonModule, CoreModule, ContezzaSearchFormModule],
    exports: [SearchFormComponent],
})
export class ContezzaSearchModule {}
