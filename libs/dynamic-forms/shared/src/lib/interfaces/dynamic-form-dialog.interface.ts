import { Observable } from 'rxjs';

import { ContezzaDisplayableValue } from '../interfaces';

export interface ContezzaDynamicFormDialog<ValueType> {
    readonly afterClosed: Observable<ValueType>;
    readonly display: (_: ValueType) => ContezzaDisplayableValue<ValueType>;
}
