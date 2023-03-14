import { Injectable } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { ObjectUtils } from '@alfresco/adf-core';

import { ContezzaIdResolverService } from '@contezza/core/extensions';
import { ContezzaStringTemplate } from '@contezza/core/utils';

import { ContezzaDisplaySource, ContezzaSimpleDisplaySource } from '../interfaces';
import { ContezzaDynamicFormDisplay } from '../interfaces/dynamic-form-display.interface';

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormDisplayService {
    static readonly PORTS = ['value', 'option'];
    static readonly UNITS = ['icon', 'label', 'tooltip', 'html'];
    static readonly COMPONENT = 'component';
    private readonly SOURCE_TYPES = [
        { label: 'Key', map: (value, key) => ObjectUtils.getValue(value, key) },
        { label: 'Template', map: (value, template) => new ContezzaStringTemplate(template).evaluate(value) },
        { label: 'Map', map: (value, source) => this.idResolver.resolve(source, 'map')(value) },
    ];

    constructor(private readonly idResolver: ContezzaIdResolverService, private readonly translate: TranslateService) {}

    resolve(source: ContezzaDisplaySource, value: any): ContezzaDynamicFormDisplay {
        const display: {
            value?: ContezzaSimpleDisplaySource;
            option?: ContezzaSimpleDisplaySource;
        } = 'display' in source ? source.display : { value: source as ContezzaSimpleDisplaySource, option: source as ContezzaSimpleDisplaySource };
        const output: ContezzaDynamicFormDisplay = {};
        ContezzaDynamicFormDisplayService.PORTS.forEach((port) => {
            if (display[port]) {
                output[port] = {};
                ContezzaDynamicFormDisplayService.UNITS.forEach((unit) => {
                    this.SOURCE_TYPES.forEach((sourceType) => {
                        if (display[port][unit + sourceType.label]) {
                            const mappedValue = sourceType.map(value, display[port][unit + sourceType.label])?.toString();
                            output[port][unit] = unit === 'label' && mappedValue ? this.translate.instant(mappedValue) : mappedValue;
                        }
                    });
                });
                const componentKey = display[port][ContezzaDynamicFormDisplayService.COMPONENT + 'Key'];
                if (componentKey) {
                    // TODO: check if this works
                    output[port][ContezzaDynamicFormDisplayService.COMPONENT] = ObjectUtils.getValue(value, componentKey);
                }
            }
        });
        return output;
    }
}
