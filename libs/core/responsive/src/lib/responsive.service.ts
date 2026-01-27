import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Injectable } from '@angular/core';

import { map, Observable, shareReplay, Subscription } from 'rxjs';

import { ContextMenuSettings } from '@contezza/core/context';

export enum ScreenSize {
    MOBILE = 'mobile',
    TABLET = 'tablet',
    DESKTOP = 'desktop',
}

@Injectable()
export class ResponsiveService {
    private readonly supportedBreakpoints = ['Handset', 'Tablet', 'Web'] as const;
    private readonly mapper: Record<(typeof this.supportedBreakpoints)[number], ScreenSize> = {
        Handset: ScreenSize.MOBILE,
        Tablet: ScreenSize.TABLET,
        Web: ScreenSize.DESKTOP,
    };

    private readonly default = ScreenSize.DESKTOP;
    private readonly cssPrefix = 'contezza-responsive-';
    private readonly contextMenuSettings: Record<ScreenSize, Partial<ContextMenuSettings>> = {
        [ScreenSize.DESKTOP]: { hasBackdrop: false },
        [ScreenSize.TABLET]: { hasBackdrop: false },
        [ScreenSize.MOBILE]: { hasBackdrop: true },
    };

    readonly screenSize$: Observable<ScreenSize> = this.breakpointObserver.observe(this.supportedBreakpoints.map(key => Breakpoints[key])).pipe(
        map(({ matches, breakpoints }) => {
            if (matches) {
                const matchingMediaQuery = Object.entries(breakpoints)
                    .find(([, val]) => val)?.[0]
                    ?.trim();
                if (matchingMediaQuery) {
                    const matchingBreakpoint = this.supportedBreakpoints.find(key =>
                        (Breakpoints[key] as string)
                            .split(',')
                            .map(query => query.trim())
                            .includes(matchingMediaQuery),
                    );
                    if (matchingBreakpoint) {
                        return this.mapper[matchingBreakpoint];
                    }
                }
            }
            console.warn('No matching screen size, using default: ' + this.default);
            return this.default;
        }),
        shareReplay(1),
    );

    readonly isMobile$ = this.screenSize$.pipe(map(value => value === ScreenSize.MOBILE));
    readonly isTablet$ = this.screenSize$.pipe(map(value => value === ScreenSize.TABLET));
    readonly isDesktop$ = this.screenSize$.pipe(map(value => value === ScreenSize.DESKTOP));
    readonly cssClass$ = this.screenSize$.pipe(map(size => this.getCssClass(size)));

    private subscription?: Subscription;
    readonly settings: Partial<ContextMenuSettings> = {};

    constructor(private readonly breakpointObserver: BreakpointObserver) {}

    init() {
        this.subscription?.unsubscribe();
        this.subscription = this.screenSize$.subscribe(value => {
            // set css class on base DOM element
            const { classList } = document.documentElement;
            classList.forEach(c => {
                if (c.startsWith(this.cssPrefix)) {
                    classList.remove(c);
                }
            });
            classList.add(this.getCssClass(value));

            // set context-menu settings
            Object.assign(this.settings, this.contextMenuSettings[value]);
        });
    }

    getCssClass(size: ScreenSize): string {
        return this.cssPrefix + size;
    }
}
