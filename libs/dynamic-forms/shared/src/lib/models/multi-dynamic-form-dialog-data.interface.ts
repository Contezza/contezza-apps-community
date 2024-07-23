import { DialogData } from '@contezza/core/dialogs';
import { Column, DynamicFormItem } from './dynamic-form-item.interface';

export type MultiDynamicFormDialogData = DialogData & { items: DynamicFormItem[]; columns: Column[] };
