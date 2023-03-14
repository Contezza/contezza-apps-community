import { ContezzaDynamicForm, ContezzaDynamicFormField, DynamicFormOptions } from '@contezza/dynamic-forms/shared';

export interface DynamicFormDialogData {
    title: string;
    titleParams?: any;
    fields?: ContezzaDynamicFormField[];
    dynamicFormId?: string;
    providedDependencies?: ContezzaDynamicForm['providedDependencies'];
    buttons: DynamicFormDialogButtons;
    options?: DynamicFormOptions;
}

export interface DynamicFormDialogButtons {
    cancel: string;
    submit: string;
}
