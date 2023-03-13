import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { Store } from '@ngrx/store';

import { Observable } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ExtensionService } from '@alfresco/adf-extensions';

import { DestroyService } from '@contezza/core/services';

import { nodeBrowserLangs, NodeBrowserSearchParams, NodeBrowserSearchResponse } from '../../interfaces/node-browser-search';
import { getLastSearchQuery, getSearchLoading, getSearchParams, getSearchResponse, getStores } from '../../store/selectors';
import { executeSearch, loadStores, setSearchParam } from '../../store/actions';
import { ColumnInfo } from '../../interfaces/column-info';

@Component({
    selector: 'mgmt-node-browser-search',
    templateUrl: './node-browser-search.component.html',
    styleUrls: ['./node-browser-search.component.scss'],
    encapsulation: ViewEncapsulation.None,
    providers: [DestroyService],
})
export class NodeBrowserSearchComponent implements OnInit {
    title: string;
    textareaValue: string;
    langs: ReadonlyArray<string> = nodeBrowserLangs;
    columns: Array<ColumnInfo> = this.extensions.getFeature('columns')?.find(({ id }) => id === 'mgmt.node-browser.columns.search')?.columns || [];
    form: FormGroup = this.fb.group({ store: ['', Validators.required], lang: ['', Validators.required] });

    stores$: Observable<Array<string>> = this.store.select(getStores);
    lastSearchQuery$: Observable<string> = this.store.select(getLastSearchQuery);
    searchParams$: Observable<NodeBrowserSearchParams> = this.store.select(getSearchParams);
    searchResponse$: Observable<NodeBrowserSearchResponse> = this.store.select(getSearchResponse);
    searchLoading$: Observable<boolean> = this.store.select(getSearchLoading);

    constructor(
        readonly store: Store<unknown>,
        private readonly fb: FormBuilder,
        private readonly route: ActivatedRoute,
        private readonly extensions: ExtensionService,
        @Inject(DestroyService) readonly destroy$: DestroyService
    ) {}

    get storeControl() {
        return this.form.get('store');
    }

    get langControl() {
        return this.form.get('lang');
    }

    ngOnInit(): void {
        const { route } = this;
        const { data } = route.snapshot;

        this.title = data.title;
        this.store.dispatch(loadStores());

        this.searchParams$.pipe(takeUntil(this.destroy$)).subscribe((params) => {
            if (this.storeControl?.value === '' && this.langControl.value === '') {
                this.storeControl.setValue(params.store);
                this.langControl.setValue(params.lang);
                this.textareaValue = params.q;
                this.executeSearch(params);
            }
        });

        this.storeControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.setParam('store', value));
        this.langControl.valueChanges.pipe(takeUntil(this.destroy$)).subscribe((value) => this.setParam('lang', value));
    }

    setParam(param: string, value: string): void {
        if (value && value !== '') {
            this.store.dispatch(setSearchParam({ param, value }));
        }
    }

    onKeyDown(event: KeyboardEvent, params: NodeBrowserSearchParams, stores: Array<string>) {
        if (event.metaKey || event.ctrlKey) {
            switch (event.key.toLowerCase()) {
                case 'enter':
                    event.stopPropagation();
                    event.preventDefault();
                    this.executeSearch(params, stores);
                    break;
                default:
                    break;
            }
        }
    }

    executeSearch(params: NodeBrowserSearchParams, stores?: Array<string>): void {
        const executeParams = params;

        if (params.lang === 'noderef' && stores?.length) {
            if (!params.q.includes(params.store)) {
                // eslint-disable-next-line prefer-const
                let queryToCheck = params.q;
                const checkResult = this.checkQuery(queryToCheck, stores);

                if (checkResult.include) {
                    queryToCheck = queryToCheck.replace(`${checkResult.store}/`, '');
                }

                const executeQuery = params.store.concat('/').concat(queryToCheck);
                this.textareaValue = executeQuery;
                executeParams.q = executeQuery;
            }
        }

        this.store.dispatch(executeSearch({ params: executeParams }));
    }

    private checkQuery(q: string, stores: Array<string>): { include: boolean; store?: string } {
        let result = { include: false, store: undefined };

        stores.forEach((currentStore) => {
            if (q.startsWith(currentStore)) {
                result = { include: true, store: currentStore };
            }
        });
        return result;
    }
}
