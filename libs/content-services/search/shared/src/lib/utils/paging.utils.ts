import { PageEvent } from '@angular/material/paginator';

import { Pagination } from '@alfresco/js-api';

export class PagingUtils {
    static ngToAlfresco({ pageSize, pageIndex }: PageEvent): Pagination {
        return { maxItems: pageSize, skipCount: pageSize * pageIndex };
    }

    static alfrescoToNg({ totalItems, maxItems, skipCount }: Pagination): PageEvent {
        return { length: totalItems, pageSize: maxItems, pageIndex: skipCount / maxItems };
    }
}
