import { DialogData } from '@contezza/core/dialogs';

import { ContezzaDynamicForm } from '../classes';
import { ExtendedDynamicFormDefinition } from './dynamic-form-id';

export type DynamicFormDialogData = DialogData & { dynamicForm?: ContezzaDynamicForm; dynamicFormId?: ExtendedDynamicFormDefinition };
