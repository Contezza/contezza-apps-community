import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { MonacoEditorModule } from '@contezza/third-party/monaco';

import { ExecuteConsoleResponse } from '../../interfaces/js-console';
import { getExecuteConsoleOutput } from '../../store/selectors';
import { JsConsoleOutputJsComponent } from './js/js-console-output-js.component';
import { JsConsoleSanitizeHtmlPipe } from '../../pipes/sanitize-html.pipe';
import { JsConsoleOutputDumpComponent } from './dump/js-console-output-dump.component';

@Component({
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatTabsModule,
        TranslateModule,
        ContezzaLetDirective,
        MonacoEditorModule,
        JsConsoleOutputJsComponent,
        JsConsoleSanitizeHtmlPipe,
        JsConsoleOutputDumpComponent,
    ],
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
