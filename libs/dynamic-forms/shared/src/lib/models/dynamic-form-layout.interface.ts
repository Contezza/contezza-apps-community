import { Observable } from 'rxjs';

import { ContezzaDisplaySource } from './extended-dynamic-form-field.interface';
import { ContezzaSimpleDisplay } from './dynamic-form-display.interface';

export interface ContezzaFormLayout {
    readonly type: ContezzaFormLayoutType;
    readonly id: string;
    readonly class?: string;
    readonly style?: string;
    readonly subfields?: ContezzaFormLayout[];
    readonly text?: string;
    readonly order?: number;
}

export interface ContezzaDynamicFormLayout extends ContezzaFormLayout {
    readonly disabled?: Observable<boolean>;
    readonly subfields?: ContezzaDynamicFormLayout[];
}

export interface ContezzaExtendedDynamicFormLayout extends ContezzaFormLayout, ContezzaSimpleDisplay {
    readonly disabled?: string;
    readonly options?: ContezzaDisplaySource;
}

export type ContezzaFormLayoutType = 'subform' | 'text' | 'field';
