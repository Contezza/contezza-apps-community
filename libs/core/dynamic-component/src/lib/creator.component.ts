import { ChangeDetectionStrategy, Component, EventEmitter, Input, OnInit, Output, Type, ViewContainerRef } from '@angular/core';

/**
 * Placeholder triggering component creation. The resolved component is created as sibling of this component.
 */
@Component({
    standalone: true,
    selector: 'contezza-creator',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent<TComponent extends object> implements OnInit {
    @Input()
    readonly component!: Type<TComponent>;

    @Input()
    readonly data?: TComponent;

    @Output()
    readonly ready = new EventEmitter<TComponent>();

    constructor(private readonly container: ViewContainerRef) {}

    ngOnInit() {
        const componentRef = this.container.createComponent(this.component);
        if (this.data) {
            Object.assign(componentRef.instance, this.data);
        }
        this.ready.next(componentRef.instance);
    }
}
