import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

export interface ViewState {
    expanded: boolean;
}

@Injectable()
export class ViewStore extends ComponentStore<ViewState> {
    // selectors
    readonly expanded$ = this.select((state) => state.expanded);

    // reducers
    readonly toggle = this.updater((state) => ({ ...state, expanded: !state.expanded }));

    constructor() {
        super({ expanded: false });
    }
}
