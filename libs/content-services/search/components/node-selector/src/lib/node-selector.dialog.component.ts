import { AfterViewInit, ChangeDetectionStrategy, Component, Inject, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { distinctUntilChanged, filter, pluck, startWith, takeUntil } from 'rxjs';

import { NodeEntry } from '@alfresco/js-api';

import { SelectionStore } from '@contezza/core/context';
import { DestroyService } from '@contezza/core/services';
import { OrArray } from '@contezza/core/utils';
import { SearchTableLayoutComponent } from '@contezza/content-services/search/components/search-table-layout';
import { ContentServicesSearchExtensionService, SearchTablePageSettings } from '@contezza/content-services/search/shared';

interface Data {
    title: string;
    configKey: string;
    multiple?: boolean;
    allowedNodeIds?: string[];
    forbiddenNodeIds?: string[];
}

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatChipsModule, MatDialogModule, MatIconModule, TranslateModule, SearchTableLayoutComponent],
    selector: 'contezza-search-node-selector-dialog',
    templateUrl: 'node-selector.dialog.component.html',
    styleUrls: ['node-selector.dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    host: {
        class: 'contezza-search-node-selector-dialog',
    },
    providers: [DestroyService, SelectionStore.withConfig({ click: 'set', ctrlClick: 'set', dblClick: 'set' })[0]],
})
export class NodeSelectorDialogComponent implements AfterViewInit {
    // allow type inference when using DialogLoaderService
    response!: OrArray<NodeEntry>;

    selectedNodes: Array<NodeEntry> = [];

    readonly settings: SearchTablePageSettings = this.makeSettings();

    @ViewChild(SearchTableLayoutComponent, { static: true })
    table!: SearchTableLayoutComponent;

    constructor(
        private readonly searchPageConfigService: ContentServicesSearchExtensionService,
        private readonly destroy$: DestroyService,
        @Inject(MAT_DIALOG_DATA) readonly data: Data
    ) {}

    ngAfterViewInit(): void {
        // focus input field
        const input = document
            .getElementsByClassName('search-table-layout-content-main-header-form')?.[0]
            ?.getElementsByTagName('contezza-input-field')?.[0]
            ?.getElementsByTagName('input')?.[0];
        input?.focus();

        // define interaction with folderType filter
        let firstSearch = true;
        const folderTypeControl = this.table.headerForm?.form?.get('folderType');
        folderTypeControl?.valueChanges
            .pipe(startWith(folderTypeControl.value), pluck('columns'), filter(Boolean), distinctUntilChanged(), takeUntil(this.destroy$))
            .subscribe((val) => {
                // disable type checks to access private properties
                const table: any = this.table;
                // make columns depend on the choice of folderType
                table.columns.id = val;
                // skip by first search to prevent a double search
                if (!firstSearch) {
                    // make change of folderType ignore search debounce
                    // NB: lower interval (100) does not work
                    table.searchParametersStore.pauseDebounce(500);
                }
                firstSearch = false;
            });

        // define interaction with table selection
        this.table.selection$.pipe(takeUntil(this.destroy$)).subscribe((selection) => {
            if (this.data.multiple) {
                // if selection is multiple, then make selectedNodes independent of table selection, to allow selection from different search results
                selection.forEach((node) => {
                    if (!this.selectedNodes.some((selected) => node.id === selected.entry.id)) {
                        this.selectedNodes.push({ entry: node });
                    } else {
                        this.removeNode({ entry: node });
                    }
                    (this.table as any).selection.reset();
                });
            } else {
                // if selection is single, then copy table selection into selectedNodes
                this.selectedNodes = selection.map((entry) => ({ entry }));
            }
        });
    }

    removeNode(node: NodeEntry): void {
        const index = this.selectedNodes.findIndex((selected) => selected.entry.id === node.entry.id);
        if (index > -1) {
            this.selectedNodes.splice(index, 1);
        }
    }

    private makeSettings(): SearchTablePageSettings {
        const settings: SearchTablePageSettings = this.searchPageConfigService.getSearchPageConfigurationByKey(this.data.configKey);

        // include allowedNodeIds (if defined) in (a copy of) settings.queryTemplate
        const copiedSettings: SearchTablePageSettings = JSON.parse(JSON.stringify(settings));
        if (this.data.allowedNodeIds?.length && copiedSettings.queryTemplate && typeof copiedSettings.queryTemplate !== 'string') {
            if (!copiedSettings.queryTemplate.filterQueries) {
                copiedSettings.queryTemplate.filterQueries = [];
            }
            copiedSettings.queryTemplate.filterQueries.push({ query: this.data.allowedNodeIds.map((id) => `sys:node-uuid:'${id}' OR ID:'${id}'`).join(' OR ') });
        }
        if (this.data.forbiddenNodeIds?.length && copiedSettings.queryTemplate && typeof copiedSettings.queryTemplate !== 'string') {
            if (!copiedSettings.queryTemplate.filterQueries) {
                copiedSettings.queryTemplate.filterQueries = [];
            }
            copiedSettings.queryTemplate.filterQueries.push({ query: `NOT (${this.data.forbiddenNodeIds.map((id) => `sys:node-uuid:'${id}' OR ID:'${id}'`).join(' OR ')})` });
        }
        return copiedSettings;
    }
}
