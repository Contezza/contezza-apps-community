import { NgModule } from '@angular/core';

import { ContezzaDynamicFormFieldModule } from '../dynamic-form-field';
import { ContezzaDynamicFormComponent } from './dynamic-form.component';
import { ContezzaDynamicFormsCommonModule } from '../../dynamic-forms.common.module';

@NgModule({
    imports: [ContezzaDynamicFormsCommonModule, ContezzaDynamicFormFieldModule, ContezzaDynamicFormComponent],
    exports: [ContezzaDynamicFormComponent],
})
export class ContezzaDynamicFormModule {}
