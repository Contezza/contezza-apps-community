import { AsyncPipe } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, inject, Input } from '@angular/core';

import { filter, map, Observable, ReplaySubject, switchMap } from 'rxjs';

import { SelectionStore } from '@contezza/core/context';
import { ContezzaObservables, CsvUtils } from '@contezza/core/utils';

import { TableComponent } from '@contezza/content-services/components/table';
import { Column } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [AsyncPipe, TableComponent],
    selector: 'tezza-csv-viewer',
    template: `@if (data$ | async; as data) {
        @defer (on immediate) {
            <!--lazy load contezza-table https://angular.dev/guide/templates/defer-->
            <contezza-table style="display: flex; height: 100%" [results]="{ list: data.list }" [columns]="data.columns" />
        }
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
    // provide new SelectionStore so that selection in this table does not interfere with the SelectionStore of the parent table
    providers: [SelectionStore],
})
export class CsvViewerComponent {
    // constructor
    private readonly http = inject(HttpClient);

    @Input()
    set url(url: string) {
        this.urlSource.next(url);
    }
    private readonly urlSource = new ReplaySubject<string>(1);
    private readonly url$ = this.urlSource.asObservable();

    readonly content$: Observable<string> = this.url$.pipe(
        switchMap(url => this.http.get(url, { responseType: 'blob' })),
        filter(Boolean),
        switchMap(blob => ContezzaObservables.from(() => blob.text())),
    );
    readonly data$: Observable<{ list: unknown[]; columns: Column[] }> = this.content$.pipe(
        map(content => {
            const { keys, objects } = CsvUtils.parse(content);
            return {
                list: objects,
                columns: keys.map(key => ({
                    id: key,
                    key,
                    title: key,
                    type: 'text',
                })),
            };
        }),
    );
}
