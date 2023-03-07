import { Pipe, PipeTransform } from '@angular/core';

import moment from 'moment';

import { ContezzaObjectUtils } from '@contezza/core/utils';

@Pipe({
    name: 'materialTableCellProperty',
    pure: true,
})
export class MaterialTableCellPropertyPipe implements PipeTransform {
    private readonly DEFAULT_LOCALE = 'nl-NL';
    private readonly DEFAULT_DATE_TIME_FORMAT = 'DD MMM YYYY';

    transform(element: any, key: string, type: string, format?: string): string {
        if (element && key) {
            const value = ContezzaObjectUtils.getValue(element, key);

            return value
                ? type === 'date'
                    ? format
                        ? format === 'timeAgo'
                            ? this.timeAgo(value)
                            : moment(new Date(value).toISOString()).format(format).toLowerCase()
                        : moment(new Date(value).toISOString()).format(this.DEFAULT_DATE_TIME_FORMAT).toLowerCase()
                    : value
                : '';
        }
        return '';
    }

    private timeAgo(value) {
        if (value !== null && value !== undefined) {
            const actualLocale = this.DEFAULT_LOCALE;
            const then = moment(value);
            const diff = moment().locale(actualLocale).diff(then, 'days');
            if (diff > 7) {
                return moment(value).format(this.DEFAULT_DATE_TIME_FORMAT).toLowerCase();
            } else {
                return then.locale(actualLocale).fromNow();
            }
        }
        return '';
    }
}
