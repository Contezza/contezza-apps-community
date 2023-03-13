import { Injectable } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

import { Observable } from 'rxjs';
import { finalize, map } from 'rxjs/operators';

/**
 * Wraps BreakpointObserver into an Observable<boolean>
 */
@Injectable({ providedIn: 'root' })
export class IsSmallScreenService extends Observable<boolean> {
    constructor(breakpointObserver: BreakpointObserver) {
        const obs = breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.HandsetLandscape]).pipe(map(({ matches }) => matches));
        super((subscriber) => obs.pipe(finalize(() => subscriber.complete())).subscribe((val) => subscriber.next(val)));
    }
}
