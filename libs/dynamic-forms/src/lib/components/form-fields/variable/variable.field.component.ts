import { ChangeDetectionStrategy, Component } from '@angular/core';

import { OrArray } from '@contezza/core/utils';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    standalone: true,
    selector: 'contezza-variable-field',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VariableFieldComponent<TBaseValue, TValue extends OrArray<TBaseValue>> extends ContezzaBaseFieldComponent<TBaseValue, TValue> {}
