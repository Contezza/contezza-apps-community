import { ChangeDetectionStrategy, Component, EventEmitter, Output } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ConsoleScript, SelectedNode } from '../../interfaces/js-console';
import { getEditorOptions, getSelectedNode, getSelectedScript, getSelectedSpaceNode } from '../../store/selectors';
import { executeScript, saveScript, selectScriptPayloadNode, setSelectedScript, toggleEditorTheme } from '../../store/actions';

@Component({
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

    constructor(readonly store: Store<unknown>, readonly router: Router) {}

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
                    selectNodeTitle: 'APP.JS_CONSOLE.HEADER.NODE_REFS.SPACE.SELECT_TITLE',
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
                    selectNodeTitle: 'APP.JS_CONSOLE.HEADER.NODE_REFS.DOCUMENT.SELECT_TITLE',
                    showFilesInSelect: true,
                },
            })
        );
    }

    toggleEditorTheme() {
        this.store.dispatch(toggleEditorTheme());
    }

    clearSelectedScript() {
        this.store.dispatch(setSelectedScript({ selectedScript: undefined }));
    }
}
