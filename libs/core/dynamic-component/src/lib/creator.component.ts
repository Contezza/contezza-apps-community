import { ChangeDetectionStrategy, Component, ComponentRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, Type, ViewContainerRef } from '@angular/core';

/**
 * Placeholder triggering component creation. The resolved component is created as sibling of this component.
 */
@Component({
    standalone: true,
    selector: 'contezza-creator',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CreatorComponent<TComponent extends object> implements OnInit, OnChanges {
    static getComponentInputNames(component: ComponentRef<any>) {
        const inputs = (component.componentType as any).ɵcmp?.inputs;
        return inputs ? Object.keys(inputs) : [];
    }

    @Input()
    readonly component!: Type<TComponent>;

    @Input()
    readonly data?: TComponent;

    @Output()
    readonly ready = new EventEmitter<TComponent>();

    private componentRef?: ComponentRef<TComponent>;
    private componentInputNames?: string[];

    constructor(private readonly container: ViewContainerRef) {}

    ngOnInit() {
        // create component
        this.componentRef = this.container.createComponent(this.component);
        this.componentInputNames = CreatorComponent.getComponentInputNames(this.componentRef);
        // initialise inputs
        this.setComponentInputs();
        // notify to the host component
        this.ready.next(this.componentRef.instance);
    }

    ngOnChanges(changes: SimpleChanges) {
        if ('data' in changes && !changes['data'].firstChange) {
            // update inputs on change
            this.setComponentInputs();
        }
    }

    private setComponentInputs() {
        if (this.data) {
            Object.entries(this.data).forEach(([key, value]) => {
                if (this.componentInputNames.includes(key)) {
                    // if the key corresponds to an @Input or InputSignal of the component, then use setInput
                    this.componentRef.setInput(key, value);
                } else {
                    // otherwise manually define the property on the component object
                    (this.componentRef.instance as any)[key] = value;
                }
            });
        }
    }
}
