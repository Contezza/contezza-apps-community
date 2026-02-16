import { DialogDataOld } from '@contezza/core/dialogs';

import { ContezzaDynamicForm } from '../classes';
import { ExtendedDynamicFormDefinition } from './dynamic-form-id';

export type DynamicFormDialogData = DialogDataOld & { dynamicForm?: ContezzaDynamicForm; dynamicFormId?: ExtendedDynamicFormDefinition };
