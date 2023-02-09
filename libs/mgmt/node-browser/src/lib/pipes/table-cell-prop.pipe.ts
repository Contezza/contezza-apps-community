import { Pipe, PipeTransform } from '@angular/core';
import moment from 'moment';

@Pipe({
    name: 'tableCellProperty',
    pure: true,
})
export class NodeBrowserTableCellPropertyPipe implements PipeTransform {
    private readonly DEFAULT_LOCALE = 'nl-NL';
    private readonly DEFAULT_DATE_TIME_FORMAT = 'DD MMM YYYY';

    transform(element: any, key: string, type: string, format?: string): string {
        if (!element || !key) {
            return '';
        }

        const keyProps = key.split('.');
        const value = keyProps.length > 1 ? element[keyProps[0]][keyProps[1]] : element[keyProps[0]];

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

    private timeAgo(value) {
        return value !== null && value !== undefined
            ? moment().locale(this.DEFAULT_LOCALE).diff(moment(value), 'days') > 7
                ? moment(value).format(this.DEFAULT_DATE_TIME_FORMAT).toLowerCase()
                : moment(value).locale(this.DEFAULT_LOCALE).fromNow()
            : '';
    }
}
