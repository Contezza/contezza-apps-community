import { Directive, Inject, Input, TemplateRef, ViewContainerRef } from '@angular/core';
import { ContezzaLetContext } from './let-context';

/**
 * Works like *ngIf but does not have a condition — use it to declare
 * the result of pipes calculation (i.e. async pipe)
 */
@Directive({
    standalone: true,
    selector: '[contezzaLet]',
})
export class ContezzaLetDirective<T> {
    @Input()
    contezzaLet!: T;

    constructor(@Inject(ViewContainerRef) viewContainer: ViewContainerRef, @Inject(TemplateRef) templateRef: TemplateRef<ContezzaLetContext<T>>) {
        viewContainer.createEmbeddedView(templateRef, new ContezzaLetContext<T>(this));
    }

    /**
     * Asserts the correct type of the context for the template that `ContezzaLet` will render.
     *
     * The presence of this method is a signal to the Ivy template type-check compiler that the
     * `ContezzaLet` structural directive renders its template with a specific context type.
     */
    static ngTemplateContextGuard<T>(_dir: ContezzaLetDirective<T>, _ctx: any): _ctx is ContezzaLetDirective<T> {
        return true;
    }
}
