import { Injectable } from '@angular/core';

import { map, startWith, switchMap, take, tap } from 'rxjs/operators';

import { ContezzaDependenciesService, ContezzaDynamicSourceProcessorService, ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaRepeatingObservable, ContezzaRule } from '@contezza/core/utils';
import {
    ContezzaDynamicForm,
    ContezzaDynamicFormDisplayService,
    ContezzaDynamicFormExtensionService,
    ContezzaDynamicFormField,
    ContezzaDynamicFormLayout,
    ContezzaDynamicFormValidationService,
    ContezzaExtendedDynamicFormField,
    ContezzaExtendedDynamicFormLayout,
} from '@contezza/dynamic-forms/shared';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormAdapterService<ExtendedDynamicFormFieldType extends ContezzaExtendedDynamicFormField = ContezzaExtendedDynamicFormField> {
    protected readonly EXTENSION_FIELD_PROPERTIES = ['defaultValue', 'initialValue', 'options', 'validations', 'dialog', 'extras', 'rules'];
    protected readonly EXTENSION_LAYOUT_PROPERTIES = ['disabled'];

    constructor(
        protected readonly extension: ContezzaDynamicFormExtensionService,
        protected readonly display: ContezzaDynamicFormDisplayService,
        protected readonly validation: ContezzaDynamicFormValidationService,
        protected readonly dependencies: ContezzaDependenciesService,
        protected readonly sourceProcessor: ContezzaDynamicSourceProcessorService,
        protected readonly idResolver: ContezzaIdResolverService
    ) {}

    adaptDynamicForm(rootField: Partial<ExtendedDynamicFormFieldType>, layout?: Partial<ContezzaExtendedDynamicFormLayout>): ContezzaDynamicForm {
        this.dependencies.init();
        return new ContezzaDynamicForm(this.adaptField(rootField), layout && this.adaptLayout(layout), this.dependencies.get());
    }

    protected adaptField(field: Partial<ExtendedDynamicFormFieldType>): ContezzaDynamicFormField {
        const adaptedField: ContezzaDynamicFormField = field as unknown as ContezzaDynamicFormField;
        this.EXTENSION_FIELD_PROPERTIES.forEach((extensionProperty) => {
            if (this[extensionProperty + 'Adapter'] && field[extensionProperty]) {
                adaptedField[extensionProperty] = this[extensionProperty + 'Adapter'](field[extensionProperty]);
            }
        });
        if (field.subfields) {
            field.subfields.forEach((subfield) => this.adaptField(subfield as ExtendedDynamicFormFieldType));
        }
        return adaptedField;
    }

    protected adaptLayout(layout: Partial<ContezzaExtendedDynamicFormLayout>): ContezzaDynamicFormLayout {
        const adaptedLayout: ContezzaDynamicFormLayout = layout as unknown as ContezzaDynamicFormLayout;
        this.EXTENSION_LAYOUT_PROPERTIES.forEach((extensionProperty) => {
            if (this[extensionProperty + 'Adapter'] && layout[extensionProperty]) {
                adaptedLayout[extensionProperty] = this[extensionProperty + 'Adapter'](layout[extensionProperty]);
            }
        });
        if (layout.subfields) {
            layout.subfields.forEach((item) => this.adaptLayout(item));
        }
        return adaptedLayout;
    }

    protected defaultValueAdapter<ValueType>(defaultValue: ExtendedDynamicFormFieldType['defaultValue']): ContezzaDynamicFormField<ValueType>['defaultValue'] {
        return new ContezzaRepeatingObservable(this.sourceProcessor.processSource(defaultValue));
    }

    protected initialValueAdapter<ValueType>(initialValue: ExtendedDynamicFormFieldType['initialValue']): ContezzaDynamicFormField<ValueType>['initialValue'] {
        return new ContezzaRepeatingObservable(this.sourceProcessor.processSource(initialValue));
    }

    protected optionsAdapter<ValueType>(options: ExtendedDynamicFormFieldType['options']): ContezzaDynamicFormField<ValueType>['options'] {
        return this.sourceProcessor
            .processSource<ValueType[]>(options)
            .smartPipe(tap((list) => list?.forEach((value) => (value.contezzaDisplay = this.display.resolve(options, value)))));
    }

    protected disabledAdapter(disabled: ContezzaExtendedDynamicFormLayout['disabled']): ContezzaDynamicFormLayout['disabled'] {
        return this.dependencies.processSource(disabled)?.pipe(
            // compatible with "disabled": true (boolean)
            map((rule) => new ContezzaRule(rule.toString()).evaluate()),
            startWith(true)
        );
    }

    protected validationsAdapter(validations: ExtendedDynamicFormFieldType['validations']): ContezzaDynamicFormField['validations'] {
        return validations.map((validation) => this.validation.resolve(validation));
    }

    protected dialogAdapter<ValueType>(dialog: ExtendedDynamicFormFieldType['dialog']): ContezzaDynamicFormField['dialog'] {
        let partial = this.sourceProcessor.processSource(dialog.parameters).pipe(
            // take 1 because dialog sources are explicitly activated by mouse click
            take(1),
            switchMap((processedParameters) => this.extension.getDialogServiceById(dialog[ContezzaDynamicSourceProcessorService.PARAM_SOURCE]).afterClosed(processedParameters))
        );
        // apply filters to value
        dialog.filters?.map((flt) => this.idResolver.resolve(flt, 'operator')).forEach((flt) => (partial = partial.pipe(flt)));
        // include display map
        return {
            afterClosed: partial,
            display: (value) => value && { ...value, contezzaDisplay: this.display.resolve(dialog, value) },
        };
    }

    protected extrasAdapter(extras: ExtendedDynamicFormFieldType['extras']): ContezzaDynamicFormField['extras'] {
        const adaptedExtras: ContezzaDynamicFormField['extras'] = {};
        Object.entries(extras).forEach(([key, val]) => {
            adaptedExtras[key] = this.sourceProcessor.processSource(val);
        });
        return adaptedExtras;
    }

    protected rulesAdapter(rules: ExtendedDynamicFormFieldType['rules']): ContezzaDynamicFormField['rules'] {
        const adaptedRules = {};
        Object.entries(rules).forEach(([key, val]) => {
            adaptedRules[key] = this.dependencies.processSource(val)?.pipe(
                map((rule) => new ContezzaRule(rule.toString()).evaluate()),
                startWith(true)
            );
        });
        return adaptedRules;
    }
}
