import { ChangeDetectorRef, Directive, HostBinding, inject, input, OnDestroy, OnInit } from '@angular/core';
import { NavigationEnd, NavigationExtras, Router } from '@angular/router';

import { Store } from '@ngrx/store';

import { filter, startWith, Subject, takeUntil } from 'rxjs';

import { AppStore } from '@alfresco/aca-shared/store';

import { NavbarItem, NavbarMode } from '../models';
import { NavbarItemUtils } from '../utils';

@Directive()
export abstract class ItemComponent implements OnInit, OnDestroy {
    // constructor
    private readonly cd = inject(ChangeDetectorRef);
    private readonly router = inject(Router);
    private readonly store = inject<Store<AppStore>>(Store);

    // inputs
    readonly item = input.required<NavbarItem>();
    readonly mode = input.required<NavbarMode>();

    @HostBinding('class')
    get modeClass() {
        return this.mode();
    }

    @HostBinding('class.active')
    classActive = false;

    private readonly destroy$ = new Subject<void>();

    ngOnInit() {
        // after each navigation check whether this element is active and update its html class accordingly
        this.router.events
            .pipe(
                filter(event => event instanceof NavigationEnd),
                startWith(void 0),
                takeUntil(this.destroy$),
            )
            .subscribe(() => {
                this.classActive = this.active;
                // without markForCheck there are issues by initialisation and when clicking on a child of another item
                this.cd.markForCheck();
            });
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
    }

    trackById<T extends { id: string }>(_index: number, { id }: T) {
        return id;
    }

    protected abstract get active(): boolean;

    protected navigateTo(item: NavbarItem, navigationExtras?: NavigationExtras) {
        const action = NavbarItemUtils.getNavigationAction(item, url => this.router.parseUrl(url), navigationExtras);
        if (action) {
            this.store.dispatch(action);
        }
    }

    protected isActive(item: NavbarItem): boolean {
        return NavbarItemUtils.isActive(item, this.router.url);
    }
}
