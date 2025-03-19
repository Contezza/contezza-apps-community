import { Directive, Input, TemplateRef, ViewContainerRef } from '@angular/core';

/**
 * Structural directive which destroys and recreates its content when a change occurs on the given variable.
 */
@Directive({
    standalone: true,
    selector: '[contezza-reload-on-change-of], [contezzaReloadOnChangeOf]',
    exportAs: 'contezzaReloadOnChangeOf',
})
export class ReloadOnChangeOfDirective {
    @Input()
    set contezzaReloadOnChangeOf(variable: any) {
        this.viewContainer.clear();
        this.viewContainer.createEmbeddedView(this.templateRef);
    }

    constructor(private readonly templateRef: TemplateRef<any>, private readonly viewContainer: ViewContainerRef) {}
}
