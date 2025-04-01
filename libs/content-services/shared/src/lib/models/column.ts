import { FormControl } from '@angular/forms';

import { DocumentListPresetRef, ExtensionElement } from '@alfresco/adf-extensions';

import { ScreenSize } from '@contezza/core/responsive';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';

import { PropertyDisplay } from './property-display';

export type Column = ExtensionElement &
    PropertyDisplay & {
        sortable?: boolean;
        sortingKey?: string;
        sticky?: boolean;
        stickyEnd?: boolean;
        hidden?: boolean | ScreenSize[];
        resizable?: boolean;
        filterable?: boolean;
        editable?: boolean;
        filter?: { field: ContezzaDynamicFormField; control: FormControl };
        width?: number;
        actions?: { click?: string };
    } & { type: string } & Pick<DocumentListPresetRef, 'format' | 'key'>; // properties which already exist as union properties in PropertyDisplay included to simplify angular templates (angular templates do not support 'in' operator)
