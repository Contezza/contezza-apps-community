import { NgModule } from '@angular/core';

import { DynamicFormOptionComponent } from './dynamic-form-option.component';
import { DynamicFormOptionDirective } from './dynamic-form-option.directive';
import { ContezzaPersonOptionModule } from '../options/person/person-option.module';

@NgModule({
    imports: [ContezzaPersonOptionModule],
    declarations: [DynamicFormOptionComponent, DynamicFormOptionDirective],
    exports: [DynamicFormOptionComponent, DynamicFormOptionDirective],
})
export class ContezzaDynamicFormOptionModule {}
