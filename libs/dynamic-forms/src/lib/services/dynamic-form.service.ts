import { Injectable } from '@angular/core';

import { JsonRegistry } from '@contezza/core/utils';
import { ContezzaDynamicForm, ExtendedDynamicFormId } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormLoaderService, ContezzaLoadedDynamicForm } from './dynamic-form-loader.service';
import { ContezzaDynamicFormAdapterService } from './dynamic-form-adapter.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormService {
    private readonly loadedDynamicForms: JsonRegistry<ContezzaLoadedDynamicForm> = new JsonRegistry<ContezzaLoadedDynamicForm>();
    private readonly initializedDynamicForms: Record<string, Record<string, ContezzaDynamicForm>> = {};

    constructor(private readonly loader: ContezzaDynamicFormLoaderService, private readonly adapter: ContezzaDynamicFormAdapterService) {}

    get(formId: ExtendedDynamicFormId, forceNew?: boolean): ContezzaDynamicForm;
    get(formId: string, layoutId?: string, forceNew?: boolean): ContezzaDynamicForm;
    get(...args: [ExtendedDynamicFormId, boolean?] | [string, string?, boolean?]): ContezzaDynamicForm {
        let formId: string;
        let layoutId: string;
        let forceNew: boolean;
        // infer input type based on args.length
        switch (args.length) {
            case 1:
                // args: [ExtendedDynamicFormId]
                [formId, layoutId] = typeof args[0] === 'string' ? [args[0], undefined] : [args[0].id, args[0].layoutId];
                break;
            case 2:
                // args: [ExtendedDynamicFormId, boolean] | [string, string]
                if (typeof args[1] === 'string') {
                    // args: [string, string]
                    [formId, layoutId] = args as any;
                } else {
                    // args: [ExtendedDynamicFormId, boolean]
                    [formId, layoutId] = typeof args[0] === 'string' ? [args[0], undefined] : [args[0].id, args[0].layoutId];
                    forceNew = args[1];
                }
                break;
            case 3:
                // args: [string, string, boolean]
                [formId, layoutId, forceNew] = args;
                break;
            default:
                throw new Error('Wrong arguments for ContezzaDynamicFormService.get');
        }
        // set default values for optional fields
        layoutId ??= ContezzaDynamicFormLoaderService.DEFAULT;

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
