import { MatFormField } from '@angular/material/form-field';

export interface DynamicFormFieldSettings {
    labelPosition?: 'before' | 'after';
    floatLabel?: MatFormField['floatLabel'];
    appearance?: MatFormField['appearance'];
    hideRequiredMarker?: MatFormField['hideRequiredMarker'];

    // textarea
    rows?: number;
    cols?: number;

    // autocomplete
    minChars?: number;
    showTotalItems?: boolean;
    preFilteredOptions?: boolean;
    subcontrolId?: string;
    selectAllOption?: { label: string; value: any };
    showSelectAllOption?: boolean;
    preSelectAllOption?: boolean;

    // subform
    setFormValueChangedValidator?: boolean;

    protected?: boolean;
}
