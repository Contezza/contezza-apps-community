import { Injectable } from '@angular/core';
import { DatePipe } from '@angular/common';

import { map, Observable, of } from 'rxjs';

import { FileSizePipe, LocalizedDatePipe, ThumbnailService, TimeAgoPipe } from '@alfresco/adf-core';

import { Formatter, FormatterResolverService, FormatterSource } from '@contezza/core/extensions';
import { MimeTypeIconPipe } from '@contezza/core/pipes';
import { ContezzaObjectUtils } from '@contezza/core/utils';

import { ExtendedString } from '../models';
import { LegacyFormatterSource } from '../models/legacy-formatter-source';

type Stringifiable = undefined | null | string | { toString: () => string };
type ExtendedStringifiable = Stringifiable | (Omit<ExtendedString, 'value'> & { value: Stringifiable });

const stringifyElementary = (x: Stringifiable): string => x?.toString() || '';
const stringify = (x: ExtendedStringifiable): ExtendedString => {
    if (x && typeof x === 'object' && 'value' in x) {
        return { ...x, value: stringifyElementary(x.value) };
    } else {
        return stringifyElementary(x);
    }
};

/**
 * Utility service which serves as a pipe collection.
 */
@Injectable({ providedIn: 'root' })
class PipeService {
    readonly date = new DatePipe('en');
    readonly adfMimeTypeIcon = new MimeTypeIconPipe(this.thumbnailService);

    constructor(
        readonly adfTimeAgo: TimeAgoPipe,
        readonly adfLocalizedDate: LocalizedDatePipe,
        readonly adfFileSize: FileSizePipe,
        private readonly thumbnailService: ThumbnailService
    ) {}
}

@Injectable({ providedIn: 'root' })
export class FormatterService {
    constructor(private readonly formatterResolver: FormatterResolverService, private readonly pipes: PipeService) {}

    getValue<TItem>(item: TItem, def: FormatterSource | LegacyFormatterSource): Observable<ExtendedStringifiable> {
        return this.getFormatter<TItem>(def)(item);
    }

    getStringifiedValue<TItem>(item: TItem, def: FormatterSource | LegacyFormatterSource): Observable<string> {
        return this.getValue<TItem>(item, def).pipe(
            map(stringify),
            map((x) => (typeof x === 'object' && 'value' in x ? x.value : x))
        );
    }

    private getFormatter<TItem>(def: FormatterSource | LegacyFormatterSource): Formatter<TItem, ExtendedStringifiable> {
        if ('type' in def && !('function' in def)) {
            return (value) =>
                of(this.resolveLegacyFormatter<TItem>(def)(value)).pipe(
                    map((v) => {
                        // include format info for type date, this is applied in 'export as excel'
                        if (def.type === 'date') {
                            return {
                                value: v,
                                formatter: {
                                    type: def.type,
                                    format: def.format,
                                },
                                toString: () => v ?? '',
                            };
                        } else {
                            return v;
                        }
                    })
                );
        } else {
            return this.formatterResolver.resolve(def);
        }
    }

    /**
     * Returns a formatter based on legacy column properties `type` and `format`.
     *
     * @param def
     * @private
     */
    private resolveLegacyFormatter<TItem>(def: LegacyFormatterSource): (_: TItem) => string {
        return (item) => this.legacyFormat(ContezzaObjectUtils.getValue(item, def.key), def);
    }

    /**
     * Formats the given value based on legacy column properties `type` and `format`.
     * If the value is an array then its items are formatted individually and then returned separated by a comma.
     *
     * @param value
     * @param def
     * @private
     */
    private legacyFormat(value: any, def: { type: string; format?: string }): string {
        return Array.isArray(value) ? value.map((_) => this.legacyFormatElementary(_, def)).join(', ') : this.legacyFormatElementary(value, def);
    }

    /**
     * Formats the given value based on legacy column properties `type` and `format`.
     * The value is assumed not to be an array.
     *
     * @param value
     * @param def
     * @private
     */
    private legacyFormatElementary(value: any, def: { type: string; format?: string }): string {
        switch (def.type) {
            case 'date':
                switch (def.format) {
                    case 'timeAgo':
                        return this.pipes.adfTimeAgo.transform(value);
                    default:
                        return this.pipes.adfLocalizedDate.transform(value, def.format);
                }
            case 'dateTime':
                return value ? this.pipes.adfLocalizedDate.transform(value, def.format) + ' ' + this.pipes.date.transform(value, 'HH:mm') : '';
            case 'fileSize':
                return this.pipes.adfFileSize.transform(value);
            case 'thumbnail':
                return this.pipes.adfMimeTypeIcon.transform(value || 'folder');
            default:
                return value ? String(value) : '';
        }
    }
}
