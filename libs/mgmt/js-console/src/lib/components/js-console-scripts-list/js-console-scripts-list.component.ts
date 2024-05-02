import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ThemePalette } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { combineLatest, Observable, Subject } from 'rxjs';
import { map, startWith, take, takeUntil } from 'rxjs/operators';

import { IconModule } from '@alfresco/adf-core';
import { NodesApiService } from '@alfresco/adf-content-services';
import { AppHookService } from '@alfresco/aca-shared';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { DestroyService } from '@contezza/core/services';
import { ContezzaSearchFormComponent } from '@contezza/search/form';

import { ConsoleScript } from '../../interfaces/js-console';
import { getScriptsList, getSelectedScript } from '../../store/selectors';
import { deleteScript, duplicateScript, loadScriptsList, loadSelectedNodeContent } from '../../store/actions';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, MatListModule, MatMenuModule, TranslateModule, IconModule, ContezzaLetDirective, ContezzaSearchFormComponent],
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
    folderOpened = false;
    scriptFolder: ConsoleScript;
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

    // hoe zorg ik ervoor dat als het de script(folder) is met de selectedscript erin blauw wordt?
    getButtonColor(selected: string, current: string, folder?: ConsoleScript): ThemePalette {
        const inFolder = folder?.submenu?.itemdata?.find((item: ConsoleScript) => item.value === selected);
        return inFolder || selected === current ? 'primary' : undefined;
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
            .subscribe((node) => this.store.dispatch(deleteScript({ payload: [{ entry: node }] })));
    }
    openFolder(folder) {
        console.log(folder);
        if (this.scriptFolder === folder) {
            this.folderOpened = !this.folderOpened;
        } else {
            this.folderOpened = true;
        }
        this.scriptFolder = folder;
    }
}
