import moment from 'moment';

export class ContezzaDate {
    static readonly NOW = 'NOW';
    static readonly TODAY = 'TODAY';
    static readonly SPECIAL_VALUES = [ContezzaDate.NOW, ContezzaDate.TODAY];
    static readonly PLUS = '+';
    static readonly MINUS = '-';

    static readonly SECOND = 1000;
    static readonly MINUTE = 60 * ContezzaDate.SECOND;
    static readonly HOUR = 60 * ContezzaDate.MINUTE;
    static readonly DAY = 24 * ContezzaDate.HOUR;
    static readonly WEEK = 7 * ContezzaDate.DAY;

    static readonly TIME_UNIT_MAPPER: Record<string, number> = {
        SECONDS: ContezzaDate.SECOND,
        MINUTES: ContezzaDate.MINUTE,
        HOURS: ContezzaDate.HOUR,
        DAYS: ContezzaDate.DAY,
        WEEKS: ContezzaDate.WEEK,
    };

    private readonly _date: Date;
    get date(): Date {
        return this._date;
    }

    static isSpecialValue(yearOrValue): boolean {
        return typeof yearOrValue === 'string' && ContezzaDate.SPECIAL_VALUES.some((specialValue) => yearOrValue.includes(specialValue));
    }

    static parseSpecialValue(value: string): Date {
        let parsedValue = value;
        if (parsedValue) {
            let baseTime: number;
            if (parsedValue.startsWith(ContezzaDate.NOW)) {
                // value is of the form:
                // NOW-SIGN-NUMBER-UNIT
                parsedValue = parsedValue.slice(ContezzaDate.NOW.length);
                baseTime = new Date().getTime();
            } else if (parsedValue.startsWith(ContezzaDate.TODAY)) {
                // value is of the form:
                // TODAY-SIGN-NUMBER-UNIT
                parsedValue = parsedValue.slice(ContezzaDate.TODAY.length);
                const now = new Date();
                baseTime = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
            }
            if (baseTime) {
                const sign = parsedValue.startsWith(ContezzaDate.PLUS) ? ContezzaDate.PLUS : parsedValue.startsWith(ContezzaDate.MINUS) ? ContezzaDate.MINUS : null;
                if (sign) {
                    parsedValue = parsedValue.slice(sign.length);
                    const n = parseInt(parsedValue, 10);
                    const unit = parsedValue.slice(n.toString().length);
                    return new Date(
                        sign === ContezzaDate.PLUS ? baseTime + n * ContezzaDate.TIME_UNIT_MAPPER[unit] : new Date().getTime() - n * ContezzaDate.TIME_UNIT_MAPPER[unit]
                    );
                }
            }
        }
        return new Date();
    }

    constructor(yearOrValue?, monthIndex?, day?, hours?, minutes?, seconds?, milliseconds?) {
        if (!yearOrValue) {
            this._date = new Date();
        } else if (!monthIndex) {
            if (ContezzaDate.isSpecialValue(yearOrValue)) {
                this._date = ContezzaDate.parseSpecialValue(yearOrValue);
            } else {
                this._date = new Date(yearOrValue);
            }
        } else if (!day) {
            this._date = new Date(yearOrValue, monthIndex);
        } else if (!hours) {
            this._date = new Date(yearOrValue, monthIndex, day);
        } else if (!minutes) {
            this._date = new Date(yearOrValue, monthIndex, day, hours);
        } else if (!seconds) {
            this._date = new Date(yearOrValue, monthIndex, day, hours, minutes);
        } else if (!milliseconds) {
            this._date = new Date(yearOrValue, monthIndex, day, hours, minutes, seconds);
        } else {
            this._date = new Date(yearOrValue, monthIndex, day, hours, minutes, seconds, milliseconds);
        }
    }

    format(format?: string): string {
        return moment(this.date).format(format);
    }

    toMoment(): moment.Moment {
        return moment(this.date);
    }
}
