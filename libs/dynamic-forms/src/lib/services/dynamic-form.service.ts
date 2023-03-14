import { Injectable } from '@angular/core';

import { JsonRegistry } from '@contezza/core/utils';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormLoaderService, ContezzaLoadedDynamicForm } from './dynamic-form-loader.service';
import { ContezzaDynamicFormAdapterService } from './dynamic-form-adapter.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormService {
    private readonly loadedDynamicForms: JsonRegistry<ContezzaLoadedDynamicForm> = new JsonRegistry<ContezzaLoadedDynamicForm>();
    private readonly initializedDynamicForms: Record<string, Record<string, ContezzaDynamicForm>> = {};

    constructor(private readonly loader: ContezzaDynamicFormLoaderService, private readonly adapter: ContezzaDynamicFormAdapterService) {}

    get(formId: string, layoutId: string = ContezzaDynamicFormLoaderService.DEFAULT, forceNew = false): ContezzaDynamicForm {
        if (!this.initializedDynamicForms[formId]) {
            this.initializedDynamicForms[formId] = {};
        }
        if (forceNew || !this.initializedDynamicForms[formId][layoutId]) {
            if (!this.loadedDynamicForms.has([formId, layoutId])) {
                this.loadedDynamicForms.set([formId, layoutId], this.loader.load(formId, layoutId));
            }
            const loadedDynamicForm = this.loadedDynamicForms.get([formId, layoutId]);
            this.initializedDynamicForms[formId][layoutId] = this.adapter.adaptDynamicForm(loadedDynamicForm.form, loadedDynamicForm.layout);
        }
        return this.initializedDynamicForms[formId][layoutId];
    }
}
