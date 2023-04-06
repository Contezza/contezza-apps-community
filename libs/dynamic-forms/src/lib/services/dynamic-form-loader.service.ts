import { Injectable } from '@angular/core';

import { ExtensionService, mergeObjects, sortByOrder } from '@alfresco/adf-extensions';

import { ContezzaDependenciesService, ContezzaDynamicSourceProcessorService } from '@contezza/core/extensions';
import { ContezzaStringTemplate, JsonRegistry } from '@contezza/core/utils';
import { ContezzaDynamicForm, ContezzaExtendedDynamicFormField, ContezzaFormField, ContezzaFormLayout } from '@contezza/dynamic-forms/shared';

export interface ContezzaLoadedDynamicForm {
    form: ContezzaFormField;
    layout: ContezzaFormLayout;
}

interface JsonDynamicForm extends Importable {
    id: string;
    form: JsonDynamicFormField;
    layouts: JsonLayout[];
}

interface JsonLayout {
    id: string;
    layout: JsonDynamicFormLayout;
}

type JsonDynamicFormField = Writeable<ContezzaExtendedDynamicFormField> & Importable;

type JsonDynamicFormLayout = DeepWriteable<ContezzaFormLayout> & Importable;

interface Importable {
    import?: string;
    readonly dependencies?: Record<string, string>;
}

type Writeable<T> = { -readonly [P in keyof T]: T[P] };
type DeepWriteable<T> = { -readonly [P in keyof T]: DeepWriteable<T[P]> };

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormLoaderService {
    static readonly DEFAULT = 'default';
    static readonly DISPLAY_PROPERTIES = ['icon', 'label', 'placeholder', 'options'];

    static readonly WARNING_NO_FORM = 'No matching dynamic form found for id = ${formId}';
    static readonly WARNING_NO_LAYOUT = 'No matching layout found for id = ${formId}, ${layoutId}';

    static readonly PLACEHOLDER_INITIAL_VALUE = 'initialValue';

    private get dynamicForms(): JsonDynamicForm[] {
        return this.extensions.getFeature('dynamicforms').map((dynamicForm) => {
            if ('form.$replace' in dynamicForm) {
                dynamicForm.form = dynamicForm['form.$replace'];
                delete dynamicForm['form.$replace'];
            }
            return dynamicForm;
        });
    }

    private loadedDynamicFormsRegistry: JsonRegistry<JsonDynamicForm>;
    private loadedLayoutsRegistry: JsonRegistry<JsonLayout>;
    private importsRegistry: Record<string, string>;

    constructor(private readonly extensions: ExtensionService, private readonly dependencies: ContezzaDependenciesService) {}

    load(formId: string, layoutId: string = ContezzaDynamicFormLoaderService.DEFAULT): ContezzaLoadedDynamicForm {
        this.loadedDynamicFormsRegistry = new JsonRegistry<JsonDynamicForm>();
        this.loadedLayoutsRegistry = new JsonRegistry<JsonLayout>();
        this.importsRegistry = {};
        const loadedDynamicForm: JsonDynamicForm = this.loadDynamicFormById(formId);
        const loadedLayout: JsonLayout = this.loadLayoutById(formId, layoutId);
        if (loadedLayout?.layout) {
            // the layout may override display properties of the fields
            this.overrideDisplays(loadedDynamicForm.form, loadedLayout.layout);
        }
        this.addInitialAndDefaultValues(loadedDynamicForm.form, formId);
        this.reset();
        return { form: loadedDynamicForm.form, layout: loadedLayout?.layout };
    }

    private getDynamicFormById(formId: string): JsonDynamicForm {
        return this.dynamicForms.find((dynamicForm) => dynamicForm.id === formId);
    }

    private loadDynamicFormById(formId: string): JsonDynamicForm {
        // entry point of dynamic form loading flow
        if (this.loadedDynamicFormsRegistry.has(formId)) {
            // if the form has already been loaded, then return it
            return this.loadedDynamicFormsRegistry.get(formId);
        } else {
            // look for a matching form in the dynamicforms.json files
            const matchingForm: JsonDynamicForm = this.dynamicForms.find((dynamicForm) => dynamicForm.id === formId);
            // if an import is declared at root level, then it is immediately resolved
            if (matchingForm?.import) {
                const matchingImport: JsonDynamicForm = this.dynamicForms.find((dynamicForm) => dynamicForm.id === matchingForm.import);
                Object.assign(matchingForm, mergeObjects(matchingImport, matchingForm));
                delete matchingForm.import;
            }
            if (matchingForm?.form) {
                // if there is a match, then:
                // check its syntax, resolve its imports
                this.resolveFormSyntaxAndImports(matchingForm.form);
                // save a hard copy of it in the register
                this.loadedDynamicFormsRegistry.set(formId, matchingForm);
                // return a hard copy
                return this.loadedDynamicFormsRegistry.get(formId);
            } else {
                console.warn(new ContezzaStringTemplate(ContezzaDynamicFormLoaderService.WARNING_NO_FORM).evaluate({ formId }));
                return undefined;
            }
        }
    }

    private resolveFormSyntaxAndImports(field: JsonDynamicFormField, path: string[] = []) {
        if (field.import) {
            const currentPath = path.slice(1).concat([field.id]).join('.');
            this.importsRegistry[currentPath] = field.import;
            // circular call to loadDynamicFormById
            // this should resolve nested imports
            const loadedDynamicForm = this.loadDynamicFormById(field.import);
            // refactoring dependencies:
            // dependencies are prefixed using the id path
            // imported subform dependencies are rewritten using the dependency map
            this.dependencies.refactorDependencies(loadedDynamicForm.form, currentPath, field.dependencies);
            // loaded data is merged with field data using alfresco extension logica
            Object.assign(field, mergeObjects(loadedDynamicForm.form, field));
        } else if (field.subfields?.length) {
            // syntax correction
            field.type = 'subform';
            // recursive calls
            // note that this field's id is included in the path
            field.subfields.forEach((subfield) => this.resolveFormSyntaxAndImports(subfield, path.concat(field.id)));
        }
    }

    private loadLayoutById(formId: string, layoutId: string): JsonLayout {
        // entry point of layout loading flow
        if (this.loadedLayoutsRegistry.has([formId, layoutId])) {
            // if the layout has already been loaded, then return it
            return this.loadedLayoutsRegistry.get([formId, layoutId]);
        } else {
            // looking for a matching form in the registry
            const matchingForm: JsonDynamicForm = this.loadedDynamicFormsRegistry.get(formId);
            // looking for a matching layout in the matchingForm's layout list
            const matchingLayout: JsonLayout =
                matchingForm?.layouts?.find((layout) => layout.id === layoutId) ?? matchingForm.layouts?.find((layout) => layout.id === ContezzaDynamicFormLoaderService.DEFAULT);
            if (matchingLayout?.layout) {
                // delete (unnecessary) id property: it may cause infinite loop
                delete matchingLayout.layout.id;
                // if there is a match, then:
                // check its syntax, resolve its imports
                this.resolveLayoutSyntaxAndImports(matchingLayout.layout, layoutId);
                // save a hard copy of it in the register
                this.loadedLayoutsRegistry.set([formId, layoutId], matchingLayout);
                // return a hard copy
                return this.loadedLayoutsRegistry.get([formId, layoutId]);
            } else {
                if (layoutId !== ContezzaDynamicFormLoaderService.DEFAULT) {
                    console.warn(
                        new ContezzaStringTemplate(ContezzaDynamicFormLoaderService.WARNING_NO_LAYOUT).evaluate({
                            formId,
                            layoutId,
                        })
                    );
                }
                return undefined;
            }
        }
    }

    private resolveLayoutSyntaxAndImports(layout: JsonDynamicFormLayout, layoutId: string) {
        if (this.importsRegistry[layout.id]) {
            // circular call to loadLayoutById
            // this should resolve nested imports
            const loadedLayout = this.loadLayoutById(this.importsRegistry[layout.id], layout.import);
            // refactoring dependencies:
            // dependencies are prefixed using the layout's id, which already includes the path
            // TODO: if needed, imported subform dependencies should be rewritten using the dependency map
            this.dependencies.refactorDependencies(loadedLayout.layout, layout.id);
            // loaded data is merged with layout data using alfresco extension logica
            Object.assign(layout, mergeObjects(loadedLayout.layout, layout));
            const prefixIds = (target) =>
                target?.forEach((subfield) => {
                    if (subfield?.id) {
                        subfield.id = layout.id + '.' + subfield.id;
                    }
                    prefixIds(subfield.subfields);
                });
            prefixIds(layout.subfields);
        } else if (layout.subfields?.length) {
            // syntax correction
            layout.type = 'subform';
            // recursive calls
            layout.subfields.forEach((subfield) => this.resolveLayoutSyntaxAndImports(subfield, layoutId));
            // subfields sorting
            layout.subfields.sort(sortByOrder);
        } else if (layout.text) {
            // syntax correction
            layout.type = 'text';
        } else {
            // syntax correction
            layout.type = 'field';
        }
    }

    private overrideDisplays(field: JsonDynamicFormField, layout: JsonDynamicFormLayout) {
        const recursiveMap = (layoutUnit: JsonDynamicFormLayout) => {
            if (layoutUnit.id) {
                const matchingField = ContezzaDynamicForm.getFieldById(field, layoutUnit.id);
                if (matchingField) {
                    ContezzaDynamicFormLoaderService.DISPLAY_PROPERTIES.forEach((property) => {
                        // using 'in' syntax, so it is possible to use layout.property = null to delete the field property
                        if (property in layoutUnit) {
                            if (layoutUnit[property] && typeof layoutUnit[property] === 'object') {
                                Object.assign(matchingField[property], layoutUnit[property]);
                            } else {
                                matchingField[property] = layoutUnit[property];
                            }
                        }
                    });
                }
            }
            layoutUnit.subfields?.forEach((subfield) => recursiveMap(subfield));
        };

        recursiveMap(layout);
    }

    private addInitialAndDefaultValues(form: JsonDynamicFormField, formId: string) {
        const recursiveMap = (field: JsonDynamicFormField, path: string[] = []) => {
            if (field.type !== 'subform') {
                if (!field.initialValue) {
                    // TODO: use variables for syntax
                    field.initialValue = {
                        type: 'value',
                        filters: ['defined'],
                    };
                    field.initialValue[ContezzaDynamicSourceProcessorService.PARAM_SOURCE] =
                        '${' + ContezzaDynamicFormLoaderService.PLACEHOLDER_INITIAL_VALUE + '$raw->' + path.slice(1).concat([field.id]).join('.') + '}';
                }
                 if (!field.defaultValue) {
                    field.defaultValue = { type: 'value', [ContezzaDynamicSourceProcessorService.PARAM_SOURCE] : field.defaultValue === undefined ? null : field.defaultValue };
                }

            }

            field.subfields?.forEach((subfield) => recursiveMap(subfield, path.concat(field.id)));
        };

        recursiveMap(form);

        const initialValueForm: JsonDynamicForm = this.getDynamicFormById(formId + '-' + ContezzaDynamicFormLoaderService.PLACEHOLDER_INITIAL_VALUE);
        if (initialValueForm?.form) {
            form.subfields.push(initialValueForm.form);
        }
    }

    private reset() {
        delete this.loadedDynamicFormsRegistry;
        delete this.loadedLayoutsRegistry;
        delete this.importsRegistry;
    }
}
