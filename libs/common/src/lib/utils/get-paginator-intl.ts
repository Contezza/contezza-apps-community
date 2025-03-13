import { MatPaginatorIntl } from '@angular/material/paginator';

import { TranslateService } from '@ngx-translate/core';

export function getPaginatorIntl(translate: TranslateService): MatPaginatorIntl {
    const paginatorIntl = new MatPaginatorIntl();
    paginatorIntl.itemsPerPageLabel = translate.instant('APP.PAGINATOR.ITEMS_PER_PAGE_LABEL');
    paginatorIntl.nextPageLabel = translate.instant('APP.PAGINATOR.NEXT_PAGE_LABEL');
    paginatorIntl.previousPageLabel = translate.instant('APP.PAGINATOR.PREVIOUS_PAGE_LABEL');
    paginatorIntl.firstPageLabel = translate.instant('APP.PAGINATOR.FIRST_PAGE_LABEL');
    paginatorIntl.lastPageLabel = translate.instant('APP.PAGINATOR.LAST_PAGE_LABEL');
    paginatorIntl.getRangeLabel = (page: number, pageSize: number, length: number): string => {
        if (length === 0 || pageSize === 0) {
            return translate.instant('APP.PAGINATOR.RANGE_PAGE_LABEL_1', { length });
        }
        length = Math.max(length, 0);
        const startIndex = page * pageSize;
        // If the start index exceeds the list length, do not try and fix the end index to the end.
        const endIndex = startIndex < length ? Math.min(startIndex + pageSize, length) : startIndex + pageSize;
        return translate.instant('APP.PAGINATOR.RANGE_PAGE_LABEL_2', { startIndex: startIndex + 1, endIndex, length });
    };
    return paginatorIntl;
}
