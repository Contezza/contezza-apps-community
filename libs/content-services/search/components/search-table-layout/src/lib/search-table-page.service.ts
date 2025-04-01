import { Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { ActivatedRoute, Params } from '@angular/router';

import { defer, distinctUntilChanged, EMPTY, map, Observable, of, shareReplay, switchMap } from 'rxjs';

import { Node } from '@alfresco/js-api';

import { ContezzaDynamicSourceProcessorService, ContezzaLoadingObservable } from '@contezza/core/extensions';
import { StringUtils } from '@contezza/core/utils';
import { ContentServicesSearchExtensionService, ExtendedSearchTableLayoutSettings, SearchTablePageSettings } from '@contezza/content-services/search/shared';

export const SEARCH_TABLE_CONFIG = new InjectionToken<ExtendedSearchTableLayoutSettings>('search-table-config');
export const SEARCH_TABLE_CONFIG_KEY = new InjectionToken<string>('search-table-config-key');
export const SEARCH_TABLE_CONFIG_KEY_FROM_ROUTE = new InjectionToken<(route: ActivatedRoute) => Observable<string>>('search-table-config-key-from-route');
export const SEARCH_TABLE_CONFIG_KEY_TEMPLATE = new InjectionToken<string>('search-table-config-key-template');

@Injectable()
export class SearchTablePageService {
    static readonly provideConfigKey = (key: string) => ({ provide: SEARCH_TABLE_CONFIG_KEY, useValue: key });
    static readonly provideConfigKeyTemplate = (keyTemplate: string) => ({ provide: SEARCH_TABLE_CONFIG_KEY_TEMPLATE, useValue: keyTemplate });

    private readonly configKeyTemplate?: (_: Params) => string = this._configKeyTemplate ? StringUtils.toTemplate(this._configKeyTemplate) : undefined;

    readonly configuration$: Observable<SearchTablePageSettings> = defer(() =>
        this.configKeyTemplate
            ? this.route.params.pipe(map((params) => this.configKeyTemplate(params)))
            : this.configKeyFromRoute
            ? this.configKeyFromRoute(this.route)
            : of(this._configKey)
    ).pipe(
        distinctUntilChanged(),
        map((configKey) => {
            let { config } = this;
            if (!config && configKey) {
                config = this.getConfigurationByKey(configKey);
            }
            if (!config) {
                throw new Error(configKey ? 'No search table page configuration with key ' + configKey : 'No search table page configuration provided');
            }
            return config;
        }),
        shareReplay(1)
    );

    readonly currentFolder$: ContezzaLoadingObservable<Node> = this.configuration$.pipe(switchMap((config) => this.getCurrentFolder(config)));

    constructor(
        private readonly route: ActivatedRoute,
        private readonly csExtensions: ContentServicesSearchExtensionService,
        private readonly sourceProcessor: ContezzaDynamicSourceProcessorService,
        @Inject(SEARCH_TABLE_CONFIG) @Optional() private readonly config?: ExtendedSearchTableLayoutSettings,
        @Inject(SEARCH_TABLE_CONFIG_KEY) @Optional() private _configKey?: string,
        @Inject(SEARCH_TABLE_CONFIG_KEY_FROM_ROUTE) @Optional() private readonly configKeyFromRoute?: (route: ActivatedRoute) => Observable<string>,
        @Inject(SEARCH_TABLE_CONFIG_KEY_TEMPLATE) @Optional() private readonly _configKeyTemplate?: string
    ) {}

    set configKey(configKey: string) {
        this._configKey = configKey;
    }

    getConfigurationByKey(key: string): ExtendedSearchTableLayoutSettings {
        return this.csExtensions.getSearchPageConfigurationByKey(key);
    }

    getCurrentFolder(config: SearchTablePageSettings): ContezzaLoadingObservable<Node> {
        const { currentFolder } = config;
        return currentFolder ? this.sourceProcessor.processSource<Node>(currentFolder).asLoadingObservable() : EMPTY;
    }
}
