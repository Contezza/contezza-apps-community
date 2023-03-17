import { ContezzaDynamicForm } from '../classes';
import { ContezzaDynamicFormField } from './dynamic-form-field.interface';
import { DynamicFormOptions } from './dynamic-form-options.interface';

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
