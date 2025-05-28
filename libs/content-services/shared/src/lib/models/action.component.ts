import { Directive, Input } from '@angular/core';

import { ContentActionRef } from '@alfresco/adf-extensions';

export interface IActionComponent<TData = ContentActionRef> {
    data: TData;
}

@Directive()
export abstract class ActionComponent<TData = ContentActionRef> implements IActionComponent<TData> {
    @Input()
    data!: TData;
}
