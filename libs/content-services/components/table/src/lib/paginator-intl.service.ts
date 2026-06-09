import { inject, Injectable } from '@angular/core';
import { MatPaginatorIntl } from '@angular/material/paginator';

import { TranslateParser, TranslateService } from '@ngx-translate/core';

import { map, startWith } from 'rxjs';

@Injectable()
export class PaginationIntlService extends MatPaginatorIntl {
    static readonly I18N = {
        en: {
            ITEMS_PER_PAGE: 'Items per page:',
            NEXT_PAGE: 'Next page',
            PREVIOUS_PAGE: 'Previous page',
            FIRST_PAGE: 'First page',
            LAST_PAGE: 'Last page',
            RANGE: {
                DEFAULT: '{{startIndex}} - {{endIndex}} of {{length}}',
                NO_RESULTS: '0 of {{length}}',
                NO_TOTAL: '{{startIndex}} - {{endIndex}}',
            },
        },
        nl: {
            ITEMS_PER_PAGE: 'Items per pagina:',
            NEXT_PAGE: 'Volgende pagina',
            PREVIOUS_PAGE: 'Vorige pagina',
            FIRST_PAGE: 'Eerste pagina',
            LAST_PAGE: 'Laatste pagina',
            RANGE: {
                DEFAULT: '{{startIndex}} - {{endIndex}} van {{length}}',
                NO_RESULTS: '0 van {{length}}',
                NO_TOTAL: '{{startIndex}} - {{endIndex}}',
            },
        },
    } as const;

    private readonly translate = inject(TranslateService);
    private readonly parser = inject(TranslateParser);

    private _showTotalItems?: boolean;
    set showTotalItems(showTotalItems: boolean) {
        this._showTotalItems = showTotalItems;
    }

    constructor() {
        super();
        this.translate.onLangChange
            .pipe(
                map(_ => _.lang),
                startWith(this.translate.currentLang),
            )
            .subscribe(lang => {
                if (lang === 'en' || lang === 'nl') {
                    const currentLangTranslations = PaginationIntlService.I18N[lang];
                    this.itemsPerPageLabel = currentLangTranslations.ITEMS_PER_PAGE;
                    this.nextPageLabel = currentLangTranslations.NEXT_PAGE;
                    this.previousPageLabel = currentLangTranslations.PREVIOUS_PAGE;
                    this.firstPageLabel = currentLangTranslations.FIRST_PAGE;
                    this.lastPageLabel = currentLangTranslations.LAST_PAGE;
                    this.getRangeLabel = (page: number, pageSize: number, length: number): string => {
                        if (length === 0 || pageSize === 0) {
                            return this.parser.interpolate(currentLangTranslations.RANGE.NO_RESULTS, { length });
                        }
                        length = Math.max(length, 0);
                        const startIndex = page * pageSize;
                        // If the start index exceeds the list length, do not try and fix the end index to the end.
                        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;

                        return this._showTotalItems
                            ? this.parser.interpolate(currentLangTranslations.RANGE.DEFAULT, {
                                  startIndex: startIndex + 1,
                                  endIndex,
                                  length,
                              })
                            : this.parser.interpolate(currentLangTranslations.RANGE.NO_TOTAL, {
                                  startIndex: startIndex + 1,
                                  endIndex,
                              });
                    };

                    this.changes.next();
                }
            });
    }
}
