import { MatAutocomplete } from '@angular/material/autocomplete';
import { MatFormField } from '@angular/material/form-field';

import { Settings } from './settings';

export interface DynamicFormFieldSettings extends Partial<Settings> {
    labelPosition?: 'before' | 'after';
    // MatFormField
    floatLabel?: MatFormField['floatLabel'];
    appearance?: MatFormField['appearance'];
    color?: MatFormField['color'];
    hideRequiredMarker?: MatFormField['hideRequiredMarker'];

    // textarea
    rows?: number;
    cols?: number;

    // autocomplete
    minChars?: number;
    showTotalItems?: boolean;
    preFilteredOptions?: boolean;
    subcontrolId?: string;
    showSelectAllOption?: boolean;
    preSelectAllOption?: boolean;
    highlight?: boolean;
    // MatAutocomplete
    panelWidth?: MatAutocomplete['panelWidth'];

    /**
     * a custom selection option for the multi-autocomplete field
     * the option is exclusive, meaning it can't be chosen simultaneously with any other options.
     * common use case: select all for server side filter
     */
    customOption?: { label: string; value: any };

    // subform
    setFormValueChangedValidator?: boolean;

    protected?: boolean;
}
