import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';

import { merge, Observable, Subject } from 'rxjs';
import { filter, map, mergeMap, pairwise, shareReplay, startWith, takeUntil, tap, withLatestFrom } from 'rxjs/operators';

import { PageTitleService } from '@alfresco/adf-core';
import { mergeObjects } from '@alfresco/adf-extensions';

import { DestroyService } from '@contezza/core/services';
import { ContezzaArrayUtils, ContezzaObjectUtils, Decoder, ObjectEntry } from '@contezza/core/utils';
import { PreferencesType, SearchParameters, SearchTablePageSettings } from '@contezza/content-services/search/shared';

import { SearchTableLayoutComponent } from './search-table-layout.component';
import { SearchTablePageService } from './search-table-page.service';

class PreferenceDefinition<T extends string> {
    readonly key: string;
    private readonly prop?: string;

    constructor(id: `${T}${`` | `->${string}`}`) {
        const [key, prop] = id.split('->');
        this.key = key;
        this.prop = prop || undefined;
    }

    matches(id: string): boolean {
        const matchesElementary = (x: string, y: string): boolean => {
            if (x === '*' || y === '*') {
                return true;
            }
            let equal = true;
            if (x.startsWith('!')) {
                x = x.slice(1);
                equal = !equal;
            }
            if (y.startsWith('!')) {
                y = y.slice(1);
                equal = !equal;
            }
            if (equal) {
                return x === y;
            } else {
                return x !== y;
            }
        };
        const frags = id.split('.');
        return this.key.split('.').every((keyFrag, index) => matchesElementary(frags[index], keyFrag));
    }

    encode(value): string {
        const key = this.prop;
        const elementaryEncoder = key ? (x) => ({ [key]: x[key] }) : (x) => x;
        const toStringify = Array.isArray(value) ? value.map((item) => elementaryEncoder(item)) || [] : elementaryEncoder(value);
        return typeof toStringify === 'string' ? toStringify.trim() : JSON.stringify(toStringify);
    }
}

@Component({
    standalone: true,
    imports: [CommonModule, SearchTableLayoutComponent],
    selector: 'contezza-search-table-page',
    template: `
        <ng-container *ngIf="settings$ | async as settings">
            <contezza-search-table-layout [settings]="settings" [extras]="extras"></contezza-search-table-layout>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [SearchTablePageService, DestroyService],
})
export class SearchTablePageComponent {
    private static readonly BROWSING_QUERY_PARAMS_DECODERS: ({ preferenceType: PreferencesType } & Decoder<Partial<Pick<SearchParameters, 'sorting' | 'paging'>>, string>)[] = [
        {
            preferenceType: PreferencesType.MaxItems,
            decode: (res) => (res ? { paging: { maxItems: parseInt(res, 10) } } : {}),
            encode: (res) => {
                const maxItems = res.paging.maxItems;
                return maxItems ? JSON.stringify(maxItems) : '';
            },
        },
        {
            preferenceType: PreferencesType.SkipCount,
            decode: (res) => (res ? { paging: { skipCount: parseInt(res, 10) } } : {}),
            encode: (res) => {
                const skipCount = res.paging.skipCount;
                return skipCount ? JSON.stringify(skipCount) : '';
            },
        },
        {
            preferenceType: PreferencesType.Sorting,
            decode: (res) => {
                if (res) {
                    const [field, direction] = res.split('-');
                    return { sorting: { type: 'FIELD', field, ascending: direction === 'asc' } };
                } else {
                    return {};
                }
            },
            encode: (res) => `${res.sorting.field}-${res.sorting.ascending ? 'asc' : 'desc'}`,
        },
    ];

    @Input()
    set configKey(configKey: string) {
        this.searchTablePageService.configKey = configKey;
    }

    readonly settings$: Observable<SearchTablePageSettings> = this.searchTablePageService.configuration$.pipe(
        tap(({ title }) => {
            if (title) {
                setTimeout(() => this.title.setTitle(title), 0);
            }
        }),
        // emit first undefined and trigger change detection to force component reset
        mergeMap((settings) => [undefined, settings]),
        tap(() => this.cd.detectChanges()),
        tap((settings) => {
            if (settings) {
                setTimeout(() => this.resetResultsSubscription(settings.queryParams || [PreferencesType.SkipCount], settings.otherQueryParams), 0);
            }
        })
    );

    private readonly queryParams$ = this.route.queryParams.pipe(
        // do not read params in viewer mode
        filter(() => !this.router.url.includes('viewer:view')),
        // prevent self-looping: distinguish navigation from an extern page and navigation in this.ngAfterViewInit()
        tap((params) => {
            const areEqual = (x, y): boolean => {
                if (!x && !y) {
                    return true;
                }
                if (!x || !y) {
                    return false;
                }
                if (Object.keys(x).length !== Object.keys(y).length) {
                    return false;
                }
                return !Object.keys(x).some((key) => !y[key] || y[key] !== x[key]);
            };

            this.areEqual = areEqual(params, this.lastParams);
        }),
        map((params: Record<string, string>) => {
            const output = {};
            Object.entries(params).forEach(([key, val]) => {
                const decoded = decodeURI(val);
                let parsed;
                try {
                    parsed = JSON.parse(decoded);
                } catch (e) {
                    parsed = decoded;
                }
                output[key] = parsed;
            });
            return output;
        }),
        startWith({}),
        // force reset of values that are not in the new params
        pairwise(),
        map(([oldParams, newParams]) => {
            Object.keys(oldParams).forEach((key) => {
                if (!(key in newParams)) {
                    newParams[key] = null;
                }
            });
            return newParams;
        }),
        filter(() => !this.areEqual),
        shareReplay(1)
    );

    readonly extras: SearchTableLayoutComponent['extras'] = {
        currentFolder$: this.searchTablePageService.currentFolder$,
        dependencies: { routeQueryParams: this.queryParams$ },
        browsingQueryParams$: this.queryParams$.pipe(
            map((params) => mergeObjects(...SearchTablePageComponent.BROWSING_QUERY_PARAMS_DECODERS.map(({ preferenceType, decode }) => decode(params[preferenceType]))))
        ),
    };

    private lastParams: Record<string, string>;
    private areEqual: boolean;
    private readonly queryParamsSource = new Subject<Record<string, string>>();
    private readonly destroyResultsSubscription$ = new Subject<void>();

    @ViewChild(SearchTableLayoutComponent)
    readonly table: SearchTableLayoutComponent;

    constructor(
        private readonly cd: ChangeDetectorRef,
        private readonly route: ActivatedRoute,
        private readonly router: Router,
        private readonly title: PageTitleService,
        private readonly searchTablePageService: SearchTablePageService,
        private readonly destroy$: DestroyService
    ) {
        this.queryParamsSource
            .asObservable()
            .pipe(takeUntil(this.destroy$))
            .subscribe((queryParams) => {
                this.lastParams = queryParams;

                this.router.navigate([], {
                    relativeTo: this.route,
                    queryParams,
                });
            });
    }

    private resetResultsSubscription(preferenceDefinitions: (PreferencesType | `${PreferencesType}.${string}`)[], otherQueryParams?: string[]) {
        this.destroyResultsSubscription$.next();

        const groupedPreferences = ContezzaArrayUtils.partitionByKey(
            preferenceDefinitions.map((def) => new PreferenceDefinition<PreferencesType | `${PreferencesType}.${string}`>(def)),
            (def) => def.key.split('.')[0] as PreferencesType
        );
        const { table } = this;
        table.results$
            .pipe(
                withLatestFrom(table.searchParameters$.pipe(filter((value): value is SearchParameters => !!value))),
                map(([, params]) =>
                    ContezzaObjectUtils.fromEntries<Record<string, string>>(
                        [
                            { form: table.headerForm, preferenceType: PreferencesType.HeaderFilters },
                            { form: table.sidebarForm, preferenceType: PreferencesType.SidebarFilters },
                            { form: table.columnForm, preferenceType: PreferencesType.ColumnFilters },
                        ]
                            .filter(({ preferenceType }) => !!groupedPreferences[preferenceType])
                            .map(({ form, preferenceType }) =>
                                form
                                    ? Object.entries(form.form.value)
                                          .filter(([, val]) => !!(val && (!Array.isArray(val) || val.length > 0)))
                                          .map((entry): [ObjectEntry<Record<string, any>>, ((_: any) => string) | undefined] => {
                                              const matchingPreference = groupedPreferences[preferenceType].find((def) => def.matches(`${preferenceType}.${entry[0]}`));
                                              const encode = matchingPreference ? (value) => encodeURI(matchingPreference.encode(value)) : undefined;
                                              return [entry, encode];
                                          })
                                          .filter(([, encode]) => !!encode)
                                          .map(([[key, val], encode]): [string, string] => [key, encode(val)])
                                    : []
                            )
                            .flat()
                            .concat(
                                SearchTablePageComponent.BROWSING_QUERY_PARAMS_DECODERS.filter(({ preferenceType }) => !!groupedPreferences[preferenceType])
                                    .map(({ preferenceType, encode }): [string, string] => [preferenceType, encode(params)])
                                    .filter(([, value]) => !!value)
                            )
                    )
                )
            )
            .pipe(takeUntil(merge(this.destroyResultsSubscription$, this.destroy$)))
            .subscribe((queryParams) => {
                // allow query params which are not defined by the search-table-page itself to be preserved
                // typical use case is a redirect url
                if (otherQueryParams) {
                    const currentQueryParamMap = this.route.snapshot.queryParamMap;
                    otherQueryParams.forEach((key) => {
                        if (currentQueryParamMap.has(key)) {
                            queryParams[key] = currentQueryParamMap.get(key) || '';
                        }
                    });
                }

                this.queryParamsSource.next(queryParams);
            });
    }
}
