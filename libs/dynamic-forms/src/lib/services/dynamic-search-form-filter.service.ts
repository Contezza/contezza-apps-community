import { Injectable, OnDestroy } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { BehaviorSubject, Observable, of } from 'rxjs';
import { catchError, debounceTime, filter, map, pairwise, switchMap, take, tap, timeout } from 'rxjs/operators';

import { AppConfigService, ObjectUtils } from '@alfresco/adf-core';

import moment from 'moment';

import { PreferencesService } from '@contezza/core/services';
import { ContezzaStringTemplate } from '@contezza/core/utils';
import { ContezzaDynamicFormField, ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';

import { ContezzaDynamicFormBuilderService } from './dynamic-form-builder.service';
import { ContezzaDynamicSearchFormService } from './dynamic-search-form.service';

interface FilterState {
    active: boolean;
    open: boolean;
    set: boolean;
}

const initialState: FilterState = {
    active: false,
    open: false,
    set: false,
};

@Injectable({
    providedIn: 'root',
})
export class ContezzaDynamicFormFilterService extends ComponentStore<FilterState> implements OnDestroy {
    private static readonly PATH_PREFERENCES = ['nl', 'contezza', '${storagePrefix}', '${formId}', '${layoutId}'];
    private static readonly TYPING_DEBOUNCE_TIME = 700;

    private dynamicForm: ContezzaDynamicSearchForm;
    private readonly dynamicFormSource = new BehaviorSubject<ContezzaDynamicSearchForm>(null);

    // selectors
    readonly active$ = this.select((state) => state.active);
    readonly open$ = this.select((state) => state.open);
    readonly set$ = this.select((state) => state.set);

    // reducers
    readonly toggle = this.updater((state) => ({ ...state, open: !state.open }));

    constructor(
        private readonly appConfig: AppConfigService,
        private readonly preferences: PreferencesService,
        private readonly dfb: ContezzaDynamicFormBuilderService,
        private readonly dynamicFormService: ContezzaDynamicSearchFormService
    ) {
        super(initialState);
    }

    init(formId: string, layoutId?: string, username?: string, dependencies?: Record<string, Observable<any>>, enabledIfHidden = true) {
        this.destroy();

        this.patchState({ active: true });

        const preferencesPath = new ContezzaStringTemplate(ContezzaDynamicFormFilterService.PATH_PREFERENCES.join('.')).evaluate({
            formId,
            layoutId,
            storagePrefix: this.appConfig.get('application.storagePrefix'),
        });

        this.dynamicForm = this.dynamicFormService.get(formId, layoutId);
        if (username) {
            this.dynamicForm.provideDependencies({
                ...dependencies,
                preferences: this.preferences.get(username, preferencesPath).pipe(map((preferences) => ObjectUtils.getValue(preferences, preferencesPath))),
            });
        }

        // the following are mostly performed by the component, but here we want the form to work even when the component is not active
        this.dfb.build(this.dynamicForm);

        if (enabledIfHidden) {
            this.dynamicForm.enable();
            this.dynamicForm.protect();
        }
        this.dynamicFormSource.next(this.dynamicForm);

        if (username) {
            this.dynamicForm.valueChanges
                .pipe(
                    debounceTime(ContezzaDynamicFormFilterService.TYPING_DEBOUNCE_TIME),
                    // filter partial autocomplete values
                    filter(() => this.dynamicForm.form.valid),
                    pairwise(),
                    map(([oldValue, newValue]) => this.constructPreferencesRequest(preferencesPath, this.processValueChanges(oldValue), this.processValueChanges(newValue))),
                    filter((preferences) => Object.keys(preferences).length > 0),
                    switchMap((preferences) => this.postPreferences(username, preferences))
                )
                .subscribe(() => {});
        }
    }

    get form(): Observable<ContezzaDynamicSearchForm> {
        return this.dynamicFormSource.asObservable();
    }

    get query(): Observable<string> {
        return this.form.pipe(
            filter((value) => !!value),
            switchMap((dynamicForm) => dynamicForm.query),
            tap((query) => this.patchState({ set: !!query }))
        );
    }

    ngOnDestroy() {
        super.ngOnDestroy();
        this.destroy();
    }

    destroy() {
        this.patchState({ active: false });
        this.dynamicForm?.destroy(true);
    }

    clear() {
        this.dynamicForm.reset('default');
    }

    private postPreferences(username: string, preferences: any): Observable<any> {
        return this.preferences.post(username, preferences).pipe(
            take(1),
            timeout(5000),
            catchError(() => of(undefined))
        );
    }

    private constructPreferencesRequest(preferencesPath: string, oldValue: Record<string, string>, newValue: Record<string, string>): Record<string, string | null> {
        const keys = Object.keys(newValue);
        Object.keys(oldValue).forEach((key) => {
            if (!keys.includes(key)) {
                keys.push(key);
            }
        });
        const body = {};
        keys.forEach((key) => {
            if (newValue[key] && (!oldValue[key] || oldValue[key] !== newValue[key])) {
                body[`${preferencesPath}.${key}`] = newValue[key];
            } else if (!newValue[key] && oldValue[key]) {
                body[`${preferencesPath}.${key}`] = null;
            }
        });
        return body;
    }

    // eslint-disable-next-line @typescript-eslint/ban-types
    private processValueChanges(value: object): Record<string, string> {
        const output = {};

        // eslint-disable-next-line @typescript-eslint/ban-types
        const recursive = (obj: object, prefix: string[] = [], parent = this.dynamicForm.rootField) => {
            Object.entries(obj)
                .filter(([, val]) => !!val)
                .forEach(([key, val]) => {
                    const newPrefix = prefix.concat(key);
                    const field = parent.subfields?.find((subfield) => subfield.id === key);
                    if (field?.subfields) {
                        recursive(val, newPrefix, field);
                    } else {
                        output[newPrefix.join('.')] = this.format(val, field);
                    }
                });
        };
        recursive(value);
        return output;
    }

    private format(value: any, field: ContezzaDynamicFormField): string {
        // TODO: this must also be configured via json and defined via extension
        switch (field.type) {
            case 'dateRange':
                const from = value.from ? moment(value.from).format('YYYY-MM-DD') : null;
                const to = value.to ? moment(value.to).format('YYYY-MM-DD') : null;
                return JSON.stringify({ from, to });
            case 'autocomplete':
                const output = {};
                Object.entries(value)
                    .filter(([key, val]) => key !== 'contezzaDisplay' && ['string', 'number', 'boolean'].includes(typeof val))
                    .forEach(([key, val]) => (output[key] = val));
                return JSON.stringify(output);
            default:
                return typeof value === 'string' ? value : JSON.stringify(value);
        }
    }
}
