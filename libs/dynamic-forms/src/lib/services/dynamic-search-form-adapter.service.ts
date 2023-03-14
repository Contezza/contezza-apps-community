import { Injectable } from '@angular/core';

import { ContezzaDependenciesService, ContezzaDynamicSourceProcessorService, ContezzaIdResolverService } from '@contezza/core/extensions';
import {
    ContezzaDynamicFormDisplayService,
    ContezzaDynamicFormExtensionService,
    ContezzaDynamicFormValidationService,
    ContezzaDynamicSearchField,
    ContezzaDynamicSearchForm,
    ContezzaExtendedDynamicFormField,
    ContezzaExtendedDynamicFormLayout,
    ContezzaExtendedDynamicSearchField,
} from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormAdapterService } from './dynamic-form-adapter.service';
import { ContezzaDynamicSearchFormQueryService } from './dynamic-search-form-query.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSearchFormAdapterService<
    ExtendedDynamicFormFieldType extends ContezzaExtendedDynamicFormField & ContezzaExtendedDynamicSearchField = ContezzaExtendedDynamicFormField &
        ContezzaExtendedDynamicSearchField
> extends ContezzaDynamicFormAdapterService<ExtendedDynamicFormFieldType> {
    protected readonly EXTENSION_FIELD_PROPERTIES = ['defaultValue', 'initialValue', 'options', 'validations', 'dialog', 'extras', 'rules', 'query'];

    constructor(
        extension: ContezzaDynamicFormExtensionService,
        display: ContezzaDynamicFormDisplayService,
        validation: ContezzaDynamicFormValidationService,
        dependencies: ContezzaDependenciesService,
        sourceProcessor: ContezzaDynamicSourceProcessorService,
        idResolver: ContezzaIdResolverService,
        protected readonly query: ContezzaDynamicSearchFormQueryService
    ) {
        super(extension, display, validation, dependencies, sourceProcessor, idResolver);
    }

    adaptDynamicForm(rootField: Partial<ExtendedDynamicFormFieldType>, layout?: Partial<ContezzaExtendedDynamicFormLayout>): ContezzaDynamicSearchForm {
        this.dependencies.init();
        return new ContezzaDynamicSearchForm(this.adaptField(rootField), layout && this.adaptLayout(layout), this.dependencies.get());
    }

    protected queryAdapter(query: ExtendedDynamicFormFieldType['query']): ContezzaDynamicSearchField['query'] {
        return this.query.resolve(query);
    }
}
