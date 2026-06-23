import { NgTemplateOutlet } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, EventEmitter, inject, input, Output } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';

import { switchMap } from 'rxjs';

import { HrefParameters, NavigationService, RouterLinkParameters } from '@contezza/core/services';

@Component({
    standalone: true,
    imports: [RouterLink, NgTemplateOutlet],
    selector: 'contezza-navigation-link',
    templateUrl: 'navigation-link.component.html',
    styles: [
        `
            a,
            span[role='link'] {
                all: unset;
                cursor: pointer;
            }

            a:hover,
            span[role='link']:hover {
                text-decoration: underline;
            }
            a:focus-visible,
            span[role='link']:focus-visible {
                outline: auto;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLinkComponent<T = unknown> {
    // constructor
    private readonly navigationService = inject(NavigationService);

    // inputs
    readonly target = input.required<T>();

    // outputs
    @Output()
    readonly navigate = new EventEmitter<void>();

    private readonly parameters = toSignal(toObservable(this.target).pipe(switchMap(target => this.navigationService.getParameters(target))));
    readonly routerLinkParameters = computed<RouterLinkParameters | undefined>(() => {
        const parameters = this.parameters();
        return parameters && 'routerLink' in parameters ? parameters : undefined;
    });
    readonly hrefParameters = computed<HrefParameters | undefined>(() => {
        const parameters = this.parameters();
        return parameters && 'href' in parameters ? parameters : undefined;
    });
}
