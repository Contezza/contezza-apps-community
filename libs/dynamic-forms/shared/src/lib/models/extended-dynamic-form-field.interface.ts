import { ContezzaBaseSource, ContezzaDynamicSource, ContezzaIdResolverSource } from '@contezza/core/extensions';

import { ContezzaFormField } from './dynamic-form-field.interface';

export interface ContezzaExtendedDynamicFormField extends ContezzaFormField {
    readonly defaultValue?: any | ContezzaDynamicSource;
    readonly initialValue?: any | ContezzaDynamicSource;
    readonly options?: (ContezzaDynamicSource | { readonly source: any[] }) & ContezzaDisplaySource;
    readonly dialog?: ContezzaDynamicSource & ContezzaDisplaySource;
    readonly validations?: ContezzaIdResolverSource<ValidationSource>[];
    readonly extras?: Record<string, string | ContezzaDynamicSource>;
    readonly rules?: {
        readonly [key: string]: string;
        readonly readonly?: string;
    };
}

export type ContezzaDisplaySource =
    | ContezzaSimpleDisplaySource
    | {
          readonly display: {
              readonly option?: ContezzaSimpleDisplaySource;
              readonly value?: ContezzaSimpleDisplaySource;
          };
      };

export interface ContezzaSimpleDisplaySource {
    readonly iconKey?: string;
    readonly iconTemplate?: string;
    readonly iconMap?: ContezzaIdResolverSource;

    readonly labelKey?: string;
    readonly labelTemplate?: string;
    readonly labelMap?: ContezzaIdResolverSource;

    readonly tooltipKey?: string;
    readonly tooltipTemplate?: string;
    readonly tooltipMap?: ContezzaIdResolverSource;

    readonly htmlKey?: string;
    readonly htmlTemplate?: string;
    readonly htmlMap?: ContezzaIdResolverSource;

    readonly componentKey?: string;
}

export interface ValidationSource extends ContezzaBaseSource {
    readonly message?: string;
}
