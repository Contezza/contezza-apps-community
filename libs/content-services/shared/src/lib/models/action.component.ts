import { Directive, Input } from '@angular/core';

import { ContentActionRef } from '@alfresco/adf-extensions';

export interface IActionComponent {
    data: ContentActionRef;
}

@Directive()
export abstract class ActionComponent implements IActionComponent {
    @Input()
    data!: ContentActionRef;
}
