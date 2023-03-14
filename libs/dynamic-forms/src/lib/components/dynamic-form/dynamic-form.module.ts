import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaDynamicFormFieldModule } from '../dynamic-form-field/dynamic-form-field.module';
import { ContezzaDynamicFormComponent } from './dynamic-form.component';
import { ContezzaDynamicSubformComponent } from './dynamic-subform.component';
import { IsTabbablePipe } from './is-tabbable.pipe';
import { ContezzaDynamicFormsCommonModule } from '../../dynamic-forms.common.module';

@NgModule({
    imports: [CommonModule, ContezzaDynamicFormsCommonModule, ContezzaDynamicFormFieldModule, ReactiveFormsModule, TranslateModule],
    declarations: [ContezzaDynamicFormComponent, ContezzaDynamicSubformComponent, IsTabbablePipe],
    exports: [ContezzaDynamicFormComponent],
})
export class ContezzaDynamicFormModule {}
