import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

import { Store } from '@ngrx/store';

import { combineLatest, Observable, Subject } from 'rxjs';
import { filter, map, startWith } from 'rxjs/operators';

import { JsConsoleDumpOutputService } from '../../../services/dump-output.service';
import { getExecuteConsoleOutput } from '../../../store/selectors';

@Component({
    selector: 'js-console-output-dump',
    templateUrl: './js-console-output-dump.component.html',
    styleUrls: ['./js-console-output-dump.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsConsoleOutputDumpComponent {
    searchValue = '';
    searchValueSource = new Subject<string>();

    dataColumns = [];
    displayedColumns = [];
    dataSource: MatTableDataSource<any>;

    data$: Observable<{ columns: Array<string>; data: Array<any> }> = this.store.select(getExecuteConsoleOutput).pipe(
        filter((output) => !!output?.dumpOutput?.length),
        map(({ dumpOutput }) => this.dumpService.constructDumpInfo(dumpOutput))
    );

    filteredData$: Observable<Array<Record<string, any>>> = combineLatest([this.data$, this.searchValueSource.asObservable().pipe(startWith(''))]).pipe(
        map(([data, searchValue]) => {
            const dump = data.data[0];
            const dumpArray = [dump];

            this.dataColumns = data.columns.filter((column) => column.includes(searchValue));
            this.dataSource = this.dumpService.getDatasource(dumpArray, this.dataColumns);
            this.displayedColumns = ['label'];

            for (let i = 0; i < dumpArray.length; i++) {
                this.displayedColumns.push('column' + i);
            }

            return dumpArray;
        })
    );

    constructor(private readonly store: Store<unknown>, private readonly dumpService: JsConsoleDumpOutputService) {}

    searchValueChange(event: string) {
        this.searchValue = event.trim().toLowerCase();
        this.searchValueSource.next(event.trim().toLowerCase());
    }
}
