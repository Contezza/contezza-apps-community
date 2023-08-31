import { ContezzaDynamicForm } from '../classes';
import { ExtendedDynamicFormDefinition } from './dynamic-form-id';

export interface DialogData {
    title: string;
    titleParams?: any;
    buttons: DynamicFormDialogButtons;
}

export type DynamicFormDialogData = DialogData & { dynamicForm?: ContezzaDynamicForm; dynamicFormId?: ExtendedDynamicFormDefinition };

export interface DynamicFormDialogButtons {
    cancel: string;
    submit: string;
}
