import { ComponentType } from '@angular/cdk/overlay';
import { ChangeDetectionStrategy, Component, effect, ElementRef, inject, input, ViewContainerRef } from '@angular/core';

import { from, of } from 'rxjs';

import { NgUtils } from '@contezza/core/utils';

import { DialogContent } from '../models';

@Component({
    standalone: true,
    selector: 'contezza-dialog-content',
    template: '',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogContentComponent {
    // constructor
    private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
    private readonly container = inject(ViewContainerRef);

    // input
    readonly content = input.required<DialogContent>();

    component?: unknown;

    constructor() {
        effect(() => {
            const content = this.content();
            switch (true) {
                case 'component' in content: {
                    const { component, inputs } = content;
                    // distinguish between possible types of `component`
                    const isComponent = (x: typeof component): x is ComponentType<any> => 'prototype' in x;
                    (isComponent(component) ? of(component) : from(component())).subscribe(cmp => {
                        // create component
                        const componentRef = this.container.createComponent(cmp);
                        // initialise inputs
                        if (inputs) {
                            const componentInputNames = NgUtils.getComponentInputNames(componentRef);
                            Object.entries(inputs).forEach(([key, value]) => {
                                if (componentInputNames.includes(key)) {
                                    // if the key corresponds to an @Input or InputSignal of the component, then use setInput
                                    componentRef.setInput(key, value);
                                } else {
                                    // otherwise manually define the property on the component object
                                    (componentRef.instance as any)[key] = value;
                                }
                            });
                        }
                        componentRef.changeDetectorRef.detectChanges();
                        this.component = componentRef.instance;
                    });
                    break;
                }
                case 'html' in content: {
                    this.elementRef.nativeElement.innerHTML = content.html;
                    break;
                }
                case 'text' in content: {
                    this.elementRef.nativeElement.textContent = content.text;
                    break;
                }
            }
        });
    }
}
