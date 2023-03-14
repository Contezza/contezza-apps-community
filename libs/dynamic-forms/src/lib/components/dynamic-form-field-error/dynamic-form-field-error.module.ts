import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { DynamicFormFieldErrorComponent } from './dynamic-form-field-error.component';

@NgModule({
    imports: [CommonModule, MatFormFieldModule, TranslateModule],
    declarations: [DynamicFormFieldErrorComponent],
    exports: [DynamicFormFieldErrorComponent],
})
export class ContezzaDynamicFormFieldErrorModule {}
