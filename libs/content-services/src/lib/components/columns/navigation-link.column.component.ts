import { ChangeDetectionStrategy, Component, ElementRef, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';

import { combineLatest, switchMap } from 'rxjs';

import { NavigationLinkComponent } from '@contezza/core/components/navigation-link';

import { ColumnComponentV2, FormatterService } from '@contezza/content-services/shared';

@Component({
    standalone: true,
    imports: [NavigationLinkComponent],
    selector: 'contezza-navigation-link-column',
    template: `@if (value(); as value) {
        <contezza-navigation-link [target]="item()" [title]="value" (click)="$event.stopPropagation(); onClick($event)" (keydown.enter)="onClick($event)">{{
            value
        }}</contezza-navigation-link>
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavigationLinkColumnComponent<TItem> extends ColumnComponentV2<TItem> {
    // constructor
    private readonly element = inject(ElementRef);
    private readonly formatter = inject(FormatterService);

    readonly value = toSignal(
        combineLatest([toObservable(this.item), toObservable(this.column)]).pipe(switchMap(([item, column]) => this.formatter.getStringifiedValue(item, column))),
    );

    onClick(event: MouseEvent | Event) {
        // dispatch dblclick event if the target itself is not already a link
        // so that a navigation action can manually be triggered from the parent table
        if ((event.target as HTMLElement).tagName !== 'A') {
            this.element.nativeElement.dispatchEvent(new MouseEvent('dblclick', { bubbles: true }));
        }
    }
}
