import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormModule } from '../dynamic-form';
import { ContezzaDynamicFormFilterComponent } from './dynamic-form-filter.component';
import { ContezzaToggleFilterModule } from './components/toggle-filter/toggle-filter.module';
import { ContezzaToggleFilterComponent } from './components/toggle-filter/toggle-filter.component';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormModule, ContezzaToggleFilterModule, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, TranslateModule],
    declarations: [ContezzaDynamicFormFilterComponent],
    exports: [ContezzaDynamicFormFilterComponent, ContezzaToggleFilterComponent],
})
export class ContezzaDynamicFormFilterModule {}
