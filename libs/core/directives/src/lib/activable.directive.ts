import { Highlightable } from '@angular/cdk/a11y';
import { ChangeDetectorRef, Directive, ElementRef, HostBinding, inject } from '@angular/core';

/**
 * Makes an element compatible with Angular CDK's ActiveDescendantKeyManager.
 *
 * The directive does not move focus to the host element. Instead, it exposes
 * the methods required by `Highlightable`, allowing the key manager to apply
 * and remove active styles while focus remains on the search input.
 */
@Directive({
    standalone: true,
    selector: '[contezzaActivable]',
})
export class ActivableDirective implements Highlightable {
    private readonly cd = inject(ChangeDetectorRef);
    private readonly element = inject(ElementRef<HTMLElement>);

    /**
     * Applies the `contezza-active` CSS class when this item becomes the
     * active element managed by the ActiveDescendantKeyManager.
     *
     * The class can be used by consuming components to define active/hover
     * visual states for keyboard navigation.
     */
    @HostBinding('class.contezza-active')
    active = false;

    /**
     * Called by ActiveDescendantKeyManager when this item becomes active.
     */
    setActiveStyles(): void {
        this.active = true;
        this.cd.markForCheck();
    }

    /**
     * Called by ActiveDescendantKeyManager when this item is no longer active.
     */
    setInactiveStyles(): void {
        this.active = false;
        this.cd.markForCheck();
    }

    /**
     * Programmatically triggers the host element's click interaction.
     *
     * This is useful when the user presses Enter while this item is active.
     */
    click(): void {
        this.element.nativeElement.click();
    }

    /**
     * Scrolls the host element into view inside its nearest scrollable container.
     *
     * `nearest` avoids unnecessary scroll jumps when the item is already visible.
     */
    scrollIntoView(): void {
        this.element.nativeElement.scrollIntoView({
            block: 'nearest',
            inline: 'nearest',
        });
    }
}
