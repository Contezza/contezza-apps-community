import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { catchError, debounceTime, distinctUntilChanged, filter, map, Observable, of, pairwise, share, skip, Subject, switchMap, take, takeUntil, tap, timeout } from 'rxjs';

import { AppStore, getUserProfile } from '@alfresco/aca-shared/store';
import { AppConfigService, AuthenticationService, ObjectUtils } from '@alfresco/adf-core';

import { showSnackbarInfo } from '@contezza/core/notifications';
import { DestroyService, PreferencesService as CorePreferencesService } from '@contezza/core/services';
import { ContezzaObservables, ContezzaStringTemplate } from '@contezza/core/utils';
import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

import { DecoderService } from './decoder.service';

export interface Source<T> {
    next: (_: T) => void;
    asObservable: () => Observable<T>;
    decode: (_: string) => T;
    encode: (_: T) => string;
}

@Injectable()
export class PreferencesService {
    private static readonly PATH = 'nl.contezza.${storagePrefix}.${id}';
    private static readonly PATH_SUB = PreferencesService.PATH + '.${subId}';
    private static readonly TEMPLATE = new ContezzaStringTemplate<{ storagePrefix: string; id: string }>(PreferencesService.PATH);
    private static readonly TEMPLATE_SUB = new ContezzaStringTemplate<{ storagePrefix: string; id: string; subId: string }>(PreferencesService.PATH_SUB);

    private static readonly TYPING_DEBOUNCE_TIME = 700;

    set id(id: string) {
        this._id = id;
        this.preferences$ = this.username$.pipe(
            switchMap(username => this.preferences.get(username, PreferencesService.TEMPLATE.evaluate({ storagePrefix: this.storagePrefix, id }))),
            share(),
        );
    }
    get id(): string {
        return this._id;
    }
    private _id: string;
    private preferences$;

    private readonly storagePrefix: string = this.appConfig.get('contezza.storagePrefix');
    private get username(): string {
        return this.auth.getEcmUsername();
    }
    private get username$(): Observable<string> {
        // see #31046
        // this.username reads value 'ACS_USERNAME' in local storage and this is not filled if auth.withCredentials: true
        // in this case we use Store as fallback
        return this.username
            ? of(this.username)
            : this.store.select(getUserProfile).pipe(
                  map(profile => profile.id),
                  filter(Boolean),
                  take(1),
              );
    }

    private boundSources: Observable<void>[] = [];
    get ready$(): Observable<boolean> {
        return ContezzaObservables.forkJoin(this.boundSources).pipe(
            tap(() => (this.boundSources = [])),
            map(() => true),
        );
    }

    constructor(
        private readonly appConfig: AppConfigService,
        private readonly auth: AuthenticationService,
        private readonly preferences: CorePreferencesService,
        private readonly decoder: DecoderService,
        private readonly destroy$: DestroyService,
        private readonly store: Store<AppStore>,
    ) {}

    clear() {
        const { storagePrefix, id } = this;
        const preferencesPath = PreferencesService.TEMPLATE.evaluate({ storagePrefix, id });
        this.username$
            .pipe(switchMap(username => this.preferences.delete(username, preferencesPath)))
            .subscribe(() => this.store.dispatch(showSnackbarInfo({ payload: 'APP.MESSAGES.PREFERENCES_CLEARED' })));
    }

    bind(form: ContezzaDynamicForm, id: string);
    bind(source: Source<any>, id: string);
    bind(formOrSource: ContezzaDynamicForm | Source<any>, id: string) {
        if (formOrSource instanceof ContezzaDynamicForm) {
            this.bindForm(formOrSource, id);
        } else {
            this.bindSource(formOrSource, id);
        }
    }

    private bindForm(form: ContezzaDynamicForm, subId: string) {
        const subject = new Subject<void>();

        const { storagePrefix, id } = this;
        const preferencesPath = PreferencesService.TEMPLATE_SUB.evaluate({ storagePrefix, id, subId });

        form.provideDependencies({
            preferences: this.preferences$.pipe(
                map(preferences => ObjectUtils.getValue(preferences, preferencesPath)),
                map(preferences => (preferences ? this.decoder.decode(preferences, form.rootField) : undefined)),
                tap(() => {
                    subject.next();
                    subject.complete();
                }),
            ),
        });

        form.valueChanges
            .pipe(
                debounceTime(PreferencesService.TYPING_DEBOUNCE_TIME),
                // filter partial autocomplete values
                // check `form.form.touched` for`requiredAtLeastOneField` validation on initial load and when filters are cleared
                filter(() => form.form.valid || !form.form.touched),
                map(value => this.decoder.encode(value, form.rootField)),
                pairwise(),
                map(([oldValue, newValue]) => this.constructPreferencesRequest(preferencesPath, oldValue, newValue)),
                filter(preferences => Object.keys(preferences).length > 0),
                switchMap(preferences => this.postPreferences(preferences)),
            )
            .subscribe();

        this.boundSources.push(subject.asObservable());
    }

    private constructPreferencesRequest(preferencesPath: string, oldValue: Record<string, string>, newValue: Record<string, string>): Record<string, string | null> {
        const keys = Object.keys(newValue);
        Object.keys(oldValue).forEach(key => {
            if (!keys.includes(key)) {
                keys.push(key);
            }
        });
        const body = {};
        keys.forEach(key => {
            if (newValue[key] && (!oldValue[key] || oldValue[key] !== newValue[key])) {
                body[`${preferencesPath}.${key}`] = newValue[key];
            } else if (!newValue[key] && oldValue[key]) {
                body[`${preferencesPath}.${key}`] = null;
            }
        });
        return body;
    }

    private postPreferences(preferences: Record<string, string | null>): Observable<object | undefined> {
        return this.username$.pipe(
            switchMap(username => this.preferences.post(username, preferences)),
            timeout(5000),
            catchError(() => of(undefined)),
        );
    }

    private bindSource<T>(source: Source<T>, subId: string) {
        const subject = new Subject<void>();

        const { storagePrefix, id } = this;
        const preferencesPath = PreferencesService.TEMPLATE_SUB.evaluate({ storagePrefix, id, subId });

        this.preferences$
            .pipe(
                map(preferences => ObjectUtils.getValue(preferences, preferencesPath)),
                map((preferences: string) => source.decode(preferences)),
            )
            .subscribe(preferences => {
                source.next(preferences);

                subject.next();
                subject.complete();

                source
                    .asObservable()
                    .pipe(
                        map(value => source.encode(value)),
                        distinctUntilChanged(),
                        skip(1),
                        switchMap(value => this.postPreferences({ [preferencesPath]: value })),
                        takeUntil(this.destroy$),
                    )
                    .subscribe();
            });

        this.boundSources.push(subject.asObservable());
    }
}
