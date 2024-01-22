import { Observable, Subject } from 'rxjs';

import { ContezzaProcessedSource, Formatter } from '@contezza/core/extensions';
import { ContezzaRepeatingObservable } from '@contezza/core/utils';

import { DynamicFormFieldSettings } from './dynamic-form-field-settings.interface';
import { ContezzaDynamicFormDialog } from './dynamic-form-dialog.interface';
import { ContezzaDynamicFormValidation } from './dynamic-form-validation.interface';
import { ContezzaDynamicFormDisplay, ContezzaSimpleDisplay } from './dynamic-form-display.interface';

export interface ContezzaFormField<ValueType = any> extends ContezzaSimpleDisplay {
    readonly id: string;
    readonly type: string;

    readonly subfields?: ContezzaFormField[];

    readonly settings?: DynamicFormFieldSettings;

    customObservable?: Subject<any>;
}

export interface ContezzaDynamicFormField<BaseValueType = any, ValueType extends BaseValueType | BaseValueType[] = BaseValueType> extends ContezzaFormField<ValueType> {
    readonly defaultValue?: ContezzaRepeatingObservable<ValueType>;
    readonly initialValue?: ContezzaRepeatingObservable<ValueType>;
    readonly format?: {
        [key: string]: Formatter<ValueType>;
        value?: Formatter<ValueType>;
    };

    readonly options?: ContezzaProcessedSource<ContezzaDisplayableValue<BaseValueType>[]>;
    readonly dialog?: ContezzaDynamicFormDialog<ValueType>;

    readonly validations?: ContezzaDynamicFormValidation[];

    // anything else, in particular custom component settings
    readonly extras?: Record<string, ContezzaProcessedSource>;

    readonly rules?: {
        readonly [key: string]: Observable<boolean>;
        readonly readonly?: Observable<boolean>;
    };
}

export type ContezzaDisplayableValue<ValueType = any> = ValueType & ContezzaDisplay;

export interface ContezzaDisplay {
    readonly contezzaDisplay: ContezzaDynamicFormDisplay;
}
