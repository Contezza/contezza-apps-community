import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { BehaviorSubject, combineLatest, isObservable, Observable, of } from 'rxjs';
import { debounceTime, distinctUntilChanged, filter, map, mapTo, switchMap, take, withLatestFrom } from 'rxjs/operators';

import { mergeObjects } from '@alfresco/adf-extensions';

import { ContezzaObservableOperators, PickByType } from '@contezza/core/utils';

import { SearchParameters } from '../../models';

type SearchParametersState = SearchParameters;

const initialState: SearchParametersState = {
    sorting: { type: 'FIELD', field: 'cm:modified', ascending: false },
    paging: { skipCount: 0, maxItems: 25 },
};

@Injectable()
export class SearchParametersStore extends ComponentStore<SearchParametersState> {
    static readonly TYPING_DEBOUNCE_TIME = 700;

    private debounce = true;

    readonly activeQueries: (keyof SearchParametersState)[] = [];
    private readonly validityChecks$: Observable<boolean>[] = [];

    private readonly switchSource = new BehaviorSubject<boolean>(false);

    // selectors
    /**
     * Filters the state if not all bound queries are provided yet.
     *
     * @private
     */
    private readonly filteredState$ = this.state$.pipe(filter((state) => ['maxItems'].every((key) => key in state.paging) && this.activeQueries.every((query) => query in state)));
    /**
     * Emits `true` when `filteredState$` emits.
     */
    readonly ready$ = this.filteredState$.pipe(mapTo(true), distinctUntilChanged());
    /**
     * Processes `filteredState$`, applying typing debounce time except if currentFolder is changing.
     * Emits the parameters if the store is switched on, `false` otherwise.
     */
    readonly parameters$: Observable<SearchParameters | false> = combineLatest([
        this.filteredState$.pipe(
            // debounce search typing except if currentFolder is changing
            ContezzaObservableOperators.debounceDiff((oldValue, newValue) =>
                !this.debounce || (oldValue?.currentFolder && newValue?.currentFolder && oldValue.currentFolder.id !== newValue.currentFolder.id)
                    ? null
                    : SearchParametersStore.TYPING_DEBOUNCE_TIME
            )
        ),
        this.switchSource.asObservable().pipe(distinctUntilChanged()),
    ]).pipe(
        // debounce because switch calls are simultaneous with other emissions
        debounceTime(0),
        // filter: let only go through if all validityChecks$ are satisfied
        switchMap((value) =>
            this.validityChecks$.length
                ? combineLatest(this.validityChecks$).pipe(
                      take(1),
                      map((valid) => [value, valid.every(Boolean)] as const),
                      filter((_) => _[1]),
                      map((_) => _[0])
                  )
                : of(value)
        ),
        map(([params, on]) => (on ? params : false))
    );
    readonly sorting$ = this.select((state) => state.sorting);
    readonly paging$ = this.select((state) => state.paging);
    readonly sidebarQuery$ = this.select((state) => state.sidebarQuery);

    constructor() {
        super(initialState);
    }

    patchState(
        partialStateOrUpdaterFn: Partial<SearchParametersState> | Observable<Partial<SearchParametersState>> | ((state: SearchParametersState) => Partial<SearchParametersState>)
    ) {
        if (isObservable(partialStateOrUpdaterFn)) {
            super.patchState(
                partialStateOrUpdaterFn.pipe(
                    withLatestFrom(this.state$),
                    withLatestFrom(this.switchSource.asObservable()),
                    map(([[partialState, state], active]) => ({
                        ...mergeObjects({ paging: state.paging }, partialState),
                        ...(active && !partialState.currentFolder ? { paging: Object.assign({}, initialState.paging, state.paging, partialState.paging || { skipCount: 0 }) } : {}),
                    }))
                )
            );
        } else if (typeof partialStateOrUpdaterFn === 'object' && !partialStateOrUpdaterFn.paging) {
            super.patchState((state) => ({ ...state, ...partialStateOrUpdaterFn, paging: { ...state.paging, skipCount: 0 } }));
        } else {
            super.patchState(partialStateOrUpdaterFn);
        }
    }

    bindQuery<T extends keyof PickByType<SearchParametersState, string>>(query$: Observable<SearchParametersState[T]>, key: T);
    bindQuery<T extends keyof PickByType<SearchParametersState, string>>(query$: Observable<SearchParametersState[T]>, valid$: Observable<boolean>, key: T);
    bindQuery<T extends keyof PickByType<SearchParametersState, string>>(query$: Observable<SearchParametersState[T]>, valid$: Observable<boolean> | T, key?: T) {
        // convert both signatures into (query$: Observable<SearchParametersState[T]>, valid$?: Observable<boolean>, key: T)
        let _valid$: Observable<boolean> | undefined;
        let _key: T;
        if (typeof valid$ === 'string') {
            // signature 1 (query$: Observable<SearchParametersState[T]>, key: T)
            _key = valid$;
        } else {
            // signature 2 (query$: Observable<SearchParametersState[T]>, valid$: Observable<boolean>, key: T)
            _valid$ = valid$;
            _key = key;
        }
        if (!this.activeQueries.includes(_key)) {
            this.activeQueries.push(_key);
            if (_valid$) {
                this.validityChecks$.push(_valid$);
            }
        }
        this.patchState(query$.pipe(map((query) => ({ [_key]: query }))));
    }

    switch(on: boolean) {
        this.switchSource.next(on);
    }

    pauseDebounce(interval: number) {
        this.debounce = false;
        setTimeout(() => (this.debounce = true), interval);
    }
}
