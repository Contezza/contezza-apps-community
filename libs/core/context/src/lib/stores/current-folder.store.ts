import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { Node } from '@alfresco/js-api';

@Injectable()
export class CurrentFolderStore extends ComponentStore<Node | undefined> {
    constructor() {
        super();
        this.setState(undefined);
    }
}
