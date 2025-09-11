import { NgModule } from '@angular/core';

import { provideTranslations } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';

import { ContezzaDynamicFormFieldErrorModule } from './components/dynamic-form-field-error/dynamic-form-field-error.module';

@NgModule({
    imports: [ContezzaDynamicFormFieldErrorModule, ContezzaLetModule],
    exports: [ContezzaDynamicFormFieldErrorModule, ContezzaLetModule],
    providers: [provideTranslations('dynamic-forms', 'assets/dynamic-forms')],
})
export class ContezzaDynamicFormsCommonModule {}
