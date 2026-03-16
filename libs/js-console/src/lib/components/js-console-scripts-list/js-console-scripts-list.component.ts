import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { ThemePalette } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { combineLatest, map, Observable, startWith, Subject, take, takeUntil } from 'rxjs';

import { DocumentListService, NodesApiService } from '@alfresco/adf-content-services';
import { IconModule } from '@alfresco/adf-core';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { DestroyService } from '@contezza/core/services';

import { ConsoleScript } from '../../interfaces/js-console';
import { deleteScript, duplicateScript, loadScriptsList, loadSelectedNodeContent } from '../../store/actions';
import { getScriptsList, getSelectedScript } from '../../store/selectors';
import { ContezzaSearchFormComponent } from '../search-form/search-form.component';

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
        map(
            ([scripts, searchValue]) =>
                scripts
                    .map(script => {
                        if (script.text.toLowerCase().includes(searchValue)) {
                            return script;
                        } else if (script.submenu) {
                            const filteredItems = script?.submenu?.itemdata?.filter(subscript => subscript.text.toLowerCase().includes(searchValue));
                            if (filteredItems?.length) {
                                //  nieuw object aanmaken om niet het originele object te overschrijven
                                return { ...script, submenu: { ...script.submenu, itemdata: filteredItems } };
                            } else {
                                return false;
                            }
                        } else {
                            return false;
                        }
                    })
                    .filter(Boolean) as any,
        ),
    );

    constructor(
        readonly store: Store<unknown>,
        private readonly nodesApiService: NodesApiService,
        private readonly appHookService: DocumentListService,
        @Inject(DestroyService) readonly destroy$: DestroyService,
    ) {}

    ngOnInit(): void {
        this.appHookService.reload$.pipe(takeUntil(this.destroy$)).subscribe(() => this.store.dispatch(loadScriptsList({ selectScript: undefined })));
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
            .subscribe(node => this.store.dispatch(deleteScript({ payload: [{ entry: node }] })));
    }
    openFolder(folder) {
        if (this.scriptFolder === folder) {
            this.folderOpened = !this.folderOpened;
        } else {
            this.folderOpened = true;
        }
        this.scriptFolder = folder;
    }
}
