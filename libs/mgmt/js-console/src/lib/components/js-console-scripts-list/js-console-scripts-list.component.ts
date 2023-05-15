import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { ThemePalette } from '@angular/material/core';

import { Store } from '@ngrx/store';

import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';

import { NodesApiService } from '@alfresco/adf-content-services';
import { AppHookService } from '@alfresco/aca-shared';

import { DestroyService } from '@contezza/core/services';

import { ConsoleScript } from '../../interfaces/js-console';
import { getScriptsList, getSelectedScript } from '../../store/selectors';
import { deleteScript, duplicateScript, loadScriptsList, loadSelectedNodeContent } from '../../store/actions';

@Component({
    selector: 'contezza-js-console-scripts-list',
    templateUrl: './js-console-scripts-list.component.html',
    styleUrls: ['./js-console-scripts-list.component.scss'],
    encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService],
})
export class JsConsoleScriptsListComponent implements OnInit {
    searchValue = '';
    searchValueSource = new Subject<string>();

    readonly selectedScript$: Observable<ConsoleScript> = this.store.select(getSelectedScript);
    readonly scripts$: Observable<Array<ConsoleScript>> = combineLatest([this.store.select(getScriptsList), this.searchValueSource.asObservable().pipe(startWith(''))]).pipe(
        map(([scripts, searchValue]) => scripts.filter((script) => script.text.includes(searchValue)))
    );

    constructor(
        readonly store: Store<unknown>,
        private readonly nodesApiService: NodesApiService,
        private readonly appHookService: AppHookService,
        @Inject(DestroyService) readonly destroy$: DestroyService
    ) {}

    ngOnInit(): void {
        this.appHookService.reload.pipe(takeUntil(this.destroy$)).subscribe(() => this.store.dispatch(loadScriptsList({ selectScript: undefined })));
    }

    trackByScript(_, script: ConsoleScript) {
        return script.text;
    }

    getButtonColor(selected: string, current: string): ThemePalette {
        return selected === current ? 'primary' : undefined;
    }

    searchValueChange(event: string) {
        this.searchValue = event.trim().toLowerCase();
        this.searchValueSource.next(event.trim().toLowerCase());
    }

    loadSelectedNodeContent(script: ConsoleScript) {
        this.store.dispatch(loadSelectedNodeContent({ script }));
    }

    duplicateScript(script: ConsoleScript, scripts: Array<ConsoleScript>) {
        this.store.dispatch(duplicateScript({ script, scripts }));
    }

    deleteScript(script: ConsoleScript) {
        const nodeId = script.value.split('/').pop();

        this.nodesApiService
            .getNode(nodeId)
            .pipe(take(1))
            .subscribe((node) => this.store.dispatch(deleteScript({ payload: [node] })));
    }
}
