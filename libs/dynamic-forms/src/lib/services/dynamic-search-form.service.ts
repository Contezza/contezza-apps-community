import { Injectable } from '@angular/core';

import { ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

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

    get(formId: string, layoutId: string = ContezzaDynamicFormLoaderService.DEFAULT): ContezzaDynamicSearchForm {
        return super.get(formId, layoutId) as ContezzaDynamicSearchForm;
    }
}
