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
    autocompletingMode?: 'server' | 'client';

    // subform
    setFormValueChangedValidator?: boolean;

    protected?: boolean;
}
