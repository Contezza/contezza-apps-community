import { ChangeDetectionStrategy, Component, Inject, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTabsModule } from '@angular/material/tabs';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { PipeModule } from '@alfresco/adf-core';

import { DestroyService } from '@contezza/core/services';
import { MonacoEditorModule } from '@contezza/third-party/monaco';

import { ConsoleEditorOptions, ScriptExecutionTime } from '../../interfaces/js-console';
import { getEditorOptions, getFmConsoleContent, getJsConsoleContent, getScriptExecutionTime } from '../../store/selectors';
import { executeScript, saveScript, setFmConsoleContent, setJsConsoleContent, setJsConsoleSelectedContent } from '../../store/actions';
import { JsConsoleContentExecutionParamsComponent } from './execution-params/js-console-content-execution-params.component';

@Component({
    standalone: true,
    imports: [CommonModule, FormsModule, MatTabsModule, TranslateModule, PipeModule, MonacoEditorModule, JsConsoleContentExecutionParamsComponent],
    selector: 'contezza-js-console-content',
    templateUrl: './js-console-content.component.html',
    styleUrls: ['./js-console-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class JsConsoleContentComponent {
    readonly scriptExecutionTime$: Observable<ScriptExecutionTime> = this.store.select(getScriptExecutionTime);
    readonly jsConsoleContent$: Observable<string | ArrayBuffer> = this.store.select(getJsConsoleContent);
    readonly fmConsoleContent$: Observable<string | ArrayBuffer> = this.store.select(getFmConsoleContent);
    readonly editorOptions$: Observable<ConsoleEditorOptions> = this.store.select(getEditorOptions).pipe(
        map((options) => ({
            ...options,
            js: { ...options.js, theme: options.theme, language: options.js.language },
            fm: { ...options.fm, theme: options.theme, language: options.fm.language },
        }))
    );

    constructor(readonly store: Store<unknown>, @Inject(DestroyService) readonly destroy$: DestroyService) {}

    setJsConsoleContent(jsContent: string): void {
        this.store.dispatch(setJsConsoleContent({ jsContent }));
        this.store.dispatch(setJsConsoleSelectedContent({ jsSelectedContent: '' }));
    }

    setFmConsoleContent(fmContent: string): void {
        this.store.dispatch(setFmConsoleContent({ fmContent }));
    }

    onSelectionChange($event: any): void {
        const target = $event.target;
        const jsSelectedContent = target.value.substring(target.selectionStart, target.selectionEnd);

        this.store.dispatch(setJsConsoleSelectedContent({ jsSelectedContent }));
    }

    onKeyDown(event: KeyboardEvent): void {
        if (event.metaKey || event.ctrlKey) {
            switch (event.key.toLowerCase()) {
                case 's':
                    event.stopPropagation();
                    event.preventDefault();
                    this.store.dispatch(saveScript());
                    break;
                case 'enter':
                    event.stopPropagation();
                    event.preventDefault();
                    this.store.dispatch(executeScript());
                    break;
                default:
                    break;
            }
        }
    }
}
