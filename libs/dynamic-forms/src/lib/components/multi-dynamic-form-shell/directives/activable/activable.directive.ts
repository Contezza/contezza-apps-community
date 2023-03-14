import { Directive, HostListener, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { DynamicFormItem } from '@contezza/dynamic-forms/shared';

import { MultiDynamicFormShellStore } from '../../multi-dynamic-form-shell.store';

@Directive({
    selector: '[contezzaActivable]',
    exportAs: 'contezzaActivable',
})
export class ContezzaActivableDirective implements OnInit {
    @Input('contezzaActivable')
    item: DynamicFormItem;

    @Input()
    activationDisabled = false;

    active$: Observable<boolean>;

    constructor(private readonly store: MultiDynamicFormShellStore) {}

    ngOnInit() {
        this.active$ = this.store.active$(this.item);
    }

    @HostListener('click')
    onClick() {
        if (!this.activationDisabled) {
            this.store.activateFile(this.item);
        }
    }
}
