import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { getExecuteScriptLoading } from '../../store/selectors';
import { loadScriptsList } from '../../store/actions';

@Component({
    selector: 'mgmt-js-console',
    templateUrl: './js-console.component.html',
    styleUrls: ['./js-console.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsConsoleComponent {
    showScriptsList = false;
    readonly executeScriptLoading$: Observable<boolean> = this.store.select(getExecuteScriptLoading);

    constructor(private readonly store: Store<unknown>) {
        this.store.dispatch(loadScriptsList({ selectScript: undefined }));
    }
}
