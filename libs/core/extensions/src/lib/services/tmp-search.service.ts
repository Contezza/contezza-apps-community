import { Injectable } from '@angular/core';

import { QueryBody, ResultSetPaging } from '@alfresco/js-api';

import { Observable } from 'rxjs';

/**
 * @deprecated
 * Temporary workaround.
 * Alfresco `SearchService` import is different in versions 5.1.0 (contezza-apps) and 6.0.0-A.3 (contezza-apps-community), therefore we cannot use it.
 * TODO: Remove this when contezza-apps is updated.
 */
@Injectable({ providedIn: 'root' })
export abstract class TmpSearchService {
    abstract searchByQueryBody(queryBody: QueryBody): Observable<ResultSetPaging>;
}
