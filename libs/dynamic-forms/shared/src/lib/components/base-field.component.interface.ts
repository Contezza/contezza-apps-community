import { FormControl } from '@angular/forms';

import { ContezzaDynamicFormField } from '../models';

export interface ContezzaBaseFieldComponentInterface<BaseValueType = any, ValueType extends BaseValueType | BaseValueType[] = BaseValueType> {
    readonly field: ContezzaDynamicFormField<BaseValueType, ValueType>;
    readonly control: FormControl;
}
