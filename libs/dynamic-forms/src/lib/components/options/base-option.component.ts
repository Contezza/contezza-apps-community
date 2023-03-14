import { Directive, Input, OnInit } from '@angular/core';

import { ContezzaBaseOptionComponentInterface } from '@contezza/dynamic-forms/shared';

@Directive()
// eslint-disable-next-line @angular-eslint/directive-class-suffix
export abstract class BaseOptionComponent<ValueType = any> implements ContezzaBaseOptionComponentInterface<ValueType>, OnInit {
    @Input()
    // TODO update ng-14
    readonly value: ValueType | any;

    ngOnInit() {}
}
