import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import moment, { Moment } from 'moment';

import { DateRange } from '../interfaces';

export class ContezzaQueries {
    private static readonly DATE_TIME_FORMAT = 'YYYY-MM-DDTHH:mm:ss';
    private static readonly ISO_COMPLETE_DATE_FORMAT = 'YYYY-MM-DD';

    static dateRange(property: string) {
        return (dateRangeSource: Observable<DateRange | undefined>): Observable<string> =>
            dateRangeSource.pipe(
                map((dateRange) => {
                    if (dateRange) {
                        const fromValue = dateRange.from;
                        const tillValue = dateRange.to;

                        const dateExist = (value) => value && value !== '' && value !== '*';

                        const from = dateExist(fromValue) ? ContezzaQueries.getFromDateTime(fromValue) : '*';
                        const till = dateExist(tillValue) ? ContezzaQueries.getTillDateTime(tillValue) : '*';

                        return dateExist(from) || dateExist(till) ? `${property}:["${from}" TO "${till}"]` : '';
                    } else {
                        return '';
                    }
                })
            );
    }

    static date(property: string) {
        return (dateSource: Observable<moment.Moment | undefined>): Observable<string> =>
            dateSource.pipe(map((date) => (date ? `${property}:["${ContezzaQueries.getFromDateTime(date)}" TO "${ContezzaQueries.getTillDateTime(date)}"]` : '')));
    }

    static isoCompleteDate(property: string) {
        return (dateSource: Observable<Moment | undefined>): Observable<string> =>
            dateSource.pipe(
                map((dateValue) => {
                    if (dateValue) {
                        const dateExist = (value) => value && value !== '' && value !== '*';

                        return dateExist(dateValue) ? `${property}:${dateValue.format(ContezzaQueries.ISO_COMPLETE_DATE_FORMAT)}` : '';
                    } else {
                        return '';
                    }
                })
            );
    }

    private static getFromDateTime(date: Moment): string {
        // moment() copy constructor, otherwise the modified date appears in the datepicker
        return moment(date).subtract(moment(date).utcOffset(), 'minutes').format(ContezzaQueries.DATE_TIME_FORMAT);
    }

    private static getTillDateTime(date: Moment): string {
        // moment() copy constructor, otherwise the modified date appears in the datepicker
        return moment(date).add(1, 'days').subtract(moment(date).utcOffset(), 'minutes').subtract(1, 'seconds').format(ContezzaQueries.DATE_TIME_FORMAT);
    }

    static boolean({ ifTrue, ifFalse }: { ifTrue?: string; ifFalse?: string }) {
        return (booleanSource: Observable<boolean | undefined>): Observable<string> =>
            // boolean !== undefined filters out controls that have not been initialised
            booleanSource.pipe(map((boolean) => (boolean !== undefined ? (boolean ? ifTrue || '' : ifFalse || '') : '')));
    }
}
