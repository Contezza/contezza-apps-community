import { Injectable } from '@angular/core';
import { WebscriptService } from '@contezza/core/services';
import { SearchParameters } from '@contezza/content-services/search/shared';
import { map, Observable, tap } from 'rxjs';
import { ResultSetPaging } from '@alfresco/js-api';
import { clientSort, dateAt, parseSidebarQuery, toResultSet } from '../utils';

@Injectable({
    providedIn: 'root',
})
export class TaskInstancesService {
    constructor(private readonly webscript: WebscriptService) {}

    searchTasks(parameters: SearchParameters): Observable<ResultSetPaging> {
        const { sorting, paging, sidebarQuery, currentFolder } = parameters;
        const q = parseSidebarQuery(sidebarQuery);

        const userId = currentFolder;

        const dueMap: Record<string, string> = {
            today: `dueAfter=${dateAt(11, 59, 59, 999)}&dueBefore=${dateAt()}`,
            tomorrow: `dueAfter=${dateAt()}&dueBefore=${dateAt()}`,
            next7Days: `dueAfter=${dateAt()}&dueBefore=${dateAt()}`,
            overdue: `dueBefore=${dateAt(11, 59, 59, 999)}`,
            noDate: 'dueBefore=',
        };

        const params: string[] = [`authority=${userId}`, `maxItems=${paging?.maxItems ?? 10}`, `skipCount=${paging?.skipCount ?? 0}`];

        if (q['assignee']) params.push(`pooledTasks=${q['assignee'] !== 'me'}`);
        if (q['priority']) params.push(`priority=${q['priority']}`);
        if (q['dueAfter'] && dueMap[q['dueAfter']]) params.push(dueMap[q['dueAfter']]);
        if (q['startedAfter']) {
            const mapStarted: Record<string, string> = {
                last7Days: `startedAfter=${dateAt(11, 59, 59, 999)}`,
                last14Days: `startedAfter=${dateAt(11, 59, 59, 999)}`,
                last28Days: `startedAfter=${dateAt(11, 59, 59, 999)}`,
            };
            if (mapStarted[q['startedAfter']]) params.push(mapStarted[q['startedAfter']]);
        }

        const url = `api/task-instances?${params.join('&')}`;

        return this.webscript.get(url).pipe(
            tap(({ data }) => clientSort(data, sorting)),
            map(({ data }) => toResultSet('task', data, paging))
        );
    }
}
