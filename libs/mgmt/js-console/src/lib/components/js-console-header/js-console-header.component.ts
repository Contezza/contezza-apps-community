import { ChangeDetectionStrategy, Component, EventEmitter, Optional, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemePalette } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { navigate } from '@contezza/common';
import { ConfigService } from '@contezza/js-console/shared';

import { ConsoleScript, SelectedNode } from '../../interfaces/js-console';
import { getEditorOptions, getSelectedNode, getSelectedScript, getSelectedSpaceNode } from '../../store/selectors';
import { executeScript, saveScript, selectScriptPayloadNode, setSelectedScript, toggleEditorTheme } from '../../store/actions';
import { JsConsoleNoderefComponent } from './noderef/js-console-noderef.component';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatTooltipModule, TranslateModule, JsConsoleNoderefComponent],
    selector: 'contezza-js-console-header',
    templateUrl: './js-console-header.component.html',
    styleUrls: ['./js-console-header.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsConsoleHeaderComponent {
    scriptListOpen: boolean;
    readonly selectedNode$: Observable<SelectedNode> = this.store.select(getSelectedNode);
    readonly selectedSpaceNode$: Observable<SelectedNode> = this.store.select(getSelectedSpaceNode);
    readonly selectedScript$: Observable<ConsoleScript> = this.store.select(getSelectedScript);
    readonly editorTheme$: Observable<string> = this.store.select(getEditorOptions).pipe(map((options) => options.theme));

    @Output()
    toggleScriptListOpenState = new EventEmitter();

    constructor(readonly store: Store<unknown>, @Optional() private readonly config?: ConfigService) {}

    get toggleIconColor(): ThemePalette {
        return this.scriptListOpen ? 'primary' : undefined;
    }

    executeScript() {
        this.store.dispatch(executeScript());
    }

    saveScript() {
        this.store.dispatch(saveScript());
    }

    selectSpaceNode() {
        this.store.dispatch(
            selectScriptPayloadNode({
                payload: {
                    type: 'spaceNoderef',
                    selectNodeTitle: 'CONTEZZA.JS_CONSOLE.HEADER.NODE_REFS.SPACE.SELECT_TITLE',
                    showFilesInSelect: false,
                },
            })
        );
    }

    selectDocumentNode() {
        this.store.dispatch(
            selectScriptPayloadNode({
                payload: {
                    type: 'document',
                    selectNodeTitle: 'CONTEZZA.JS_CONSOLE.HEADER.NODE_REFS.DOCUMENT.SELECT_TITLE',
                    showFilesInSelect: true,
                },
            })
        );
    }

    removeDocumentNode() {
        if (this.config?.path) {
            this.store.dispatch(navigate({ payload: [[this.config.path]] }));
        }
    }

    toggleEditorTheme() {
        this.store.dispatch(toggleEditorTheme());
    }

    clearSelectedScript() {
        this.store.dispatch(setSelectedScript({ selectedScript: undefined }));
    }
}
