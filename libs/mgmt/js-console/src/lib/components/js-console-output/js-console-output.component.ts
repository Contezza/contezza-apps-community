import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { ExecuteConsoleResponse } from '../../interfaces/js-console';
import { getExecuteConsoleOutput } from '../../store/selectors';

@Component({
    selector: 'contezza-js-console-output',
    templateUrl: './js-console-output.component.html',
    styleUrls: ['./js-console-output.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class JsConsoleOutputComponent implements OnInit {
    consoleOutput$: Observable<ExecuteConsoleResponse>;

    constructor(readonly store: Store<unknown>) {}

    ngOnInit(): void {
        this.consoleOutput$ = this.store.select(getExecuteConsoleOutput);
    }
}
