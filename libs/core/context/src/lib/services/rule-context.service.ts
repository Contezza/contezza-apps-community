import { Injectable, Injector, Optional, SkipSelf } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, combineLatest, Observable, of } from 'rxjs';
import { map, scan } from 'rxjs/operators';

import { AppConfigService, AuthenticationService } from '@alfresco/adf-core';
import { ExtensionService, RuleContext, RuleEvaluator } from '@alfresco/adf-extensions';
import { NodePermissionService } from '@alfresco/aca-shared';
import { AppStore, getRuleContext } from '@alfresco/aca-shared/store';

import { ContezzaObservables } from '@contezza/core/utils';

import { CurrentFolderStore, SelectionStore } from '../stores';

/**
 * Injectable wrapper of ruleContext sources.
 * Replaces Alfresco's app-selection state and app-current-folder state with current folder and selection from component store.
 * Allows to push custom data into the ruleContext.
 *
 * Usage: provide a new instance of `RuleContextService` by a new instance of `CurrentFolderStore` or `SelectionStore` to include the component current folder or selection state in any child rule context.
 */
@Injectable({ providedIn: 'root' })
export class RuleContextService<T extends Record<string, any> = Record<string, never>> extends Observable<T & RuleContext> {
    private readonly ruleContextSource: BehaviorSubject<Partial<T & RuleContext>>;

    constructor(
        injector: Injector,
        appConfig: AppConfigService,
        auth: AuthenticationService,
        extensions: ExtensionService,
        permissions: NodePermissionService,
        @Optional() @SkipSelf() ruleContext$: RuleContextService,
        @Optional() currentFolderStore: CurrentFolderStore,
        @Optional() selectionStore: SelectionStore<unknown>
    ) {
        const ruleContextSource = new BehaviorSubject<Partial<T & RuleContext>>(undefined);

        super(
            ContezzaObservables.copyConstructor(
                combineLatest([
                    combineLatest([
                        // as basis, use the default Store<AppStore> or a parent instance of RuleContextService
                        ruleContext$ ?? injector.get<Store<AppStore>>(Store).select(getRuleContext),
                        // include component stores for current folder and selection (if any)
                        currentFolderStore?.state$ || of(undefined),
                        selectionStore?.selectionState$ || of(undefined),
                    ]).pipe(
                        map(([ruleContext, currentFolder, selection]) => ({
                            ...ruleContext,
                            ...(currentFolderStore ? { navigation: { ...ruleContext.navigation, currentFolder } } : {}),
                            ...(selectionStore ? { selection } : {}),
                            appConfig,
                            auth,
                            permissions,
                            getEvaluator: (key: string): RuleEvaluator => extensions.getEvaluator(key),
                        }))
                    ),
                    // include custom extra context
                    ruleContextSource.asObservable().pipe(scan((acc, ruleContext) => Object.assign(acc, ruleContext), {} as Partial<T & RuleContext>)),
                ]).pipe(map(([base, extra]) => Object.assign(base, extra || {}) as unknown as T & RuleContext))
                // cannot debounce, otherwise super.dispatch() calls in ContezzaComponentStoreService.dispatch() are delayed and file upload does not work correctly
            )
        );

        this.ruleContextSource = ruleContextSource;
    }

    /**
     * Injects custom data into the ruleContext.
     *
     * @param context Custom data to be injected into the ruleContext.
     */
    next(context: Partial<T & RuleContext>) {
        this.ruleContextSource.next(context);
    }
}
