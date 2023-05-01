import { FloatLabelType, MatFormFieldAppearance } from '@angular/material/form-field';

export interface DynamicFormFieldSettings {
    labelPosition?: 'before' | 'after';
    floatLabel?: FloatLabelType;
    appearance?: MatFormFieldAppearance;

    // textarea
    rows?: number;
    cols?: number;

    // autocomplete
    minChars?: number;
    showTotalItems?: boolean;
    preFilteredOptions?: boolean;
    subcontrolId?: string;
    selectAllOption?: { label: string; value: any };

    // subform
    setFormValueChangedValidator?: boolean;

    protected?: boolean;
}
