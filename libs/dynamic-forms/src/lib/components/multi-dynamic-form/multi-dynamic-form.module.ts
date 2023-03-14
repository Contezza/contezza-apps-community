import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';

import { ContezzaDynamicFormModule } from '../dynamic-form';

import { MultiDynamicFormComponent } from './multi-dynamic-form.component';

@NgModule({
    imports: [CommonModule, MatButtonModule, TranslateModule, ContezzaLetModule, ContezzaDynamicFormModule],
    declarations: [MultiDynamicFormComponent],
    exports: [MultiDynamicFormComponent],
})
export class MultiDynamicFormModule {}
