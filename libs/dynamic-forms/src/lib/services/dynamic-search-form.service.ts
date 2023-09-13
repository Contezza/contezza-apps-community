import { Injectable } from '@angular/core';

import { ContezzaDynamicSearchForm, ExtendedDynamicFormId } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormService } from './dynamic-form.service';
import { ContezzaDynamicFormLoaderService } from './dynamic-form-loader.service';
import { ContezzaDynamicSearchFormAdapterService } from './dynamic-search-form-adapter.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicSearchFormService extends ContezzaDynamicFormService {
    constructor(loader: ContezzaDynamicFormLoaderService, adapter: ContezzaDynamicSearchFormAdapterService) {
        super(loader, adapter);
    }

    get(formId: ExtendedDynamicFormId, forceNew?: boolean): ContezzaDynamicSearchForm;
    get(formId: string, layoutId?: string, forceNew?: boolean): ContezzaDynamicSearchForm;
    get(...args: [ExtendedDynamicFormId, boolean?] | [string, string?, boolean?]): ContezzaDynamicSearchForm {
        return super.get(...(args as [any])) as ContezzaDynamicSearchForm;
    }
}
