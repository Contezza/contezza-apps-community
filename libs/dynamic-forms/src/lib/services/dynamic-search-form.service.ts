import { Injectable } from '@angular/core';

import { ContezzaDynamicSearchForm, ExtendedDynamicFormId } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from './dynamic-form.service';
import { ContezzaDynamicFormLoaderService } from './dynamic-form-loader.service';
import { ContezzaDynamicSearchFormAdapterService } from './dynamic-search-form-adapter.service';
import { ExtensionService } from '@alfresco/adf-extensions';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSearchFormService extends ContezzaDynamicFormService {
    constructor(loader: ContezzaDynamicFormLoaderService, adapter: ContezzaDynamicSearchFormAdapterService, extensions: ExtensionService) {
        super(loader, adapter, extensions);
    }

    get(formId: ExtendedDynamicFormId, forceNew?: boolean): ContezzaDynamicSearchForm;
    get(formId: string, layoutId?: string, forceNew?: boolean): ContezzaDynamicSearchForm;
    get(...args: [ExtendedDynamicFormId, boolean?] | [string, string?, boolean?]): ContezzaDynamicSearchForm {
        return super.get(...(args as [any])) as ContezzaDynamicSearchForm;
    }
}
