import { Observable } from 'rxjs';

import { DocumentListPresetRef } from '@alfresco/adf-extensions';

export interface Column extends DocumentListPresetRef {
    expandedOnly?: boolean;
    collapsedOnly?: boolean;
}

export interface DynamicFormItem {
    id: string;
    selected?: boolean;
    formId: string;
    layoutId?: string;
    dependencies?: Record<string, Observable<any>>;
}

export interface DynamicFormItemGroup {
    id: string;
    title?: string;
    showHeader?: boolean;
    columns: Column[];
    items: DynamicFormItem[];
}
