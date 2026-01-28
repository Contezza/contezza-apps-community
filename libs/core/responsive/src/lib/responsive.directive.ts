import { Directive, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { of } from 'rxjs';

import { ResponsiveService } from './responsive.service';

/**
 * Binds the current contezza-responsive CSS class, i.e. `contezza-responsive-mobile`, `contezza-responsive-table` or `contezza-responsive-desktop`, to the host component.
 */
@Directive({
    standalone: true,
    selector: '[contezzaResponsive]',
    host: {
        '[class]': 'cssClass()',
    },
})
export class ResponsiveDirective {
    // constructor
    private readonly responsive = inject(ResponsiveService, { optional: true });

    readonly cssClass = toSignal(this.responsive?.cssClass$ || of(''));
}
