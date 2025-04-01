import { Injectable } from '@angular/core';
import moment from 'moment';
import { ContezzaDynamicFormField } from '@contezza/dynamic-forms/shared';
import { ContezzaObjectUtils, DateRange } from '@contezza/core/utils';

@Injectable({ providedIn: 'root' })
export class DecoderService {
    /**
     * Preferences to dynamic-form
     *
     * @param value
     * @param model
     */
    decode(value, model: ContezzaDynamicFormField): any {
        const output = {};
        const recursive = (obj: object, prefix: string[] = [], parent = model) =>
            Object.entries(obj)
                .filter(([, val]) => !!val)
                .forEach(([key, val]) => {
                    const newPrefix = prefix.concat(key);
                    const field = parent.subfields?.find(({ id }) => id === key);
                    if (field) {
                        if (field.subfields) {
                            recursive(val, newPrefix, field);
                        } else {
                            ContezzaObjectUtils.setValue(output, newPrefix.join('.'), this.decodeElementary(val, field.type));
                        }
                    }
                });
        recursive(value);
        return output;
    }

    /**
     * Preferences to dynamic-form
     *
     * @param value
     * @param type
     */
    decodeElementary(value, type: string): any {
        switch (type) {
            case 'dateRange':
            case 'dateRangeChip':
                const parseDateRange = (date: { from: any; to: any }): DateRange => {
                    const from = date.from && moment(date.from);
                    const to = date.to && moment(date.to);
                    return from || to ? { from, to } : null;
                };
                return value ? parseDateRange(JSON.parse(value)) : undefined;
            case 'autocomplete':
            case 'multiautocomplete':
            case 'chipsInput':
            case 'toggle': // booleans are saved as stringified
            case 'button-toggle':
            case 'peoplePicker':
                return value ? JSON.parse(value) : undefined;
            default:
                return value;
        }
    }

    /**
     * Dynamic-form to preferences
     *
     * @param value
     * @param model
     */
    encode(value, model: ContezzaDynamicFormField): any {
        const output = {};
        const recursive = (obj: object, prefix: string[] = [], parent = model) =>
            Object.entries(obj)
                .filter(([, val]) => !!val || val === false)
                .forEach(([key, val]) => {
                    const newPrefix = prefix.concat(key);
                    const field = parent.subfields?.find(({ id }) => id === key);
                    if (field?.subfields) {
                        recursive(val, newPrefix, field);
                    } else {
                        output[newPrefix.join('.')] = this.encodeElementary(val, field.type);
                    }
                });
        recursive(value);
        return output;
    }

    /**
     * Dynamic-form to preferences
     *
     * @param value
     * @param type
     */
    encodeElementary(value, type: string): any {
        switch (type) {
            case 'dateRange':
            case 'dateRangeChip':
                const from = value.from ? moment(value.from).format('YYYY-MM-DD') : null;
                const to = value.to ? moment(value.to).format('YYYY-MM-DD') : null;
                return JSON.stringify({ from, to });
            case 'autocomplete':
            case 'button-toggle':
                return JSON.stringify(this.encodeObject(value));
            case 'multiautocomplete':
            case 'peoplePicker':
                return JSON.stringify(value.filter(Boolean).map((item) => this.encodeObject(item)));
            default:
                return typeof value === 'string' ? value : JSON.stringify(value);
        }
    }

    encodeObject(value): any {
        const output = {};
        Object.entries(value)
            .filter(([key, val]) => key !== 'contezzaDisplay' && ['string', 'number', 'boolean'].includes(typeof val))
            .forEach(([key, val]) => (output[key] = val));
        return output;
    }
}
