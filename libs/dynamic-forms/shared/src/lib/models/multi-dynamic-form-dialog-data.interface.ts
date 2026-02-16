import { DialogDataOld } from '@contezza/core/dialogs';

import { Column, DynamicFormItem } from './dynamic-form-item.interface';

export type MultiDynamicFormDialogData = DialogDataOld & { items: DynamicFormItem[]; columns: Column[] };
