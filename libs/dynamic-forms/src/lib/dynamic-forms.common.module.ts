import { NgModule } from '@angular/core';

import { TranslationService } from '@alfresco/adf-core';

import { ContezzaLetModule } from '@contezza/core/directives';

import { ContezzaDynamicFormFieldErrorModule } from './components/dynamic-form-field-error/dynamic-form-field-error.module';

@NgModule({
    imports: [ContezzaDynamicFormFieldErrorModule, ContezzaLetModule],
    exports: [ContezzaDynamicFormFieldErrorModule, ContezzaLetModule],
})
export class ContezzaDynamicFormsCommonModule {
    constructor(translation: TranslationService) {
        translation.addTranslationFolder('dynamic-forms', 'assets/dynamic-forms');
    }
}
