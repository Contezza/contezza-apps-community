import { ChangeDetectionStrategy, Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressBarModule } from '@angular/material/progress-bar';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { PageLayoutModule } from '@alfresco/aca-shared';

import { getExecuteScriptLoading } from '../../store/selectors';
import { loadScriptsList } from '../../store/actions';
import { ResizerDirective } from '../../directives/resizer.directive';
import { JsConsoleHeaderComponent } from '../js-console-header/js-console-header.component';
import { JsConsoleContentComponent } from '../js-console-content/js-console-content.component';
import { JsConsoleOutputComponent } from '../js-console-output/js-console-output.component';
import { JsConsoleScriptsListComponent } from '../js-console-scripts-list/js-console-scripts-list.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        MatProgressBarModule,
        PageLayoutModule,
        JsConsoleHeaderComponent,
        JsConsoleContentComponent,
        ResizerDirective,
        JsConsoleOutputComponent,
        JsConsoleScriptsListComponent,
    ],
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
