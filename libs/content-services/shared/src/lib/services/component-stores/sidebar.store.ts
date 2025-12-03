import { Injectable } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

export enum SidebarContentType {
    Info = 'info',
    Form = 'form',
    Preset = 'preset',
}

interface DynamicComponentPayload {
    id: string;
    data?: any;
    activeSidebarClass?: string;
}

export type SidebarContent = SidebarContentType | DynamicComponentPayload;

/**
 * Checks equality between `SidebarContent`'s: equals if both strings and equal or both objects with equal `id` and `data`.
 *
 * @param x
 * @param y
 */
const areEqual = (x: SidebarContent, y: SidebarContent): boolean => {
    if (typeof x === 'string') {
        return x === y;
    } else if (typeof y !== 'string') {
        return x.id === y.id && x.data === y.data;
    } else {
        return false;
    }
};

export interface SidebarState {
    expanded: boolean;
    content?: SidebarContent;
    hideTitle?: boolean;
}

@Injectable()
export class SidebarStore extends ComponentStore<SidebarState> {
    // selectors
    readonly expanded$ = this.select((state) => state.expanded);
    private readonly _content$ = this.select((state) => state.content);
    readonly content$ = this.select(this.expanded$, this._content$, (expanded, content) => (expanded ? content : undefined));

    // reducers
    readonly toggle = this.updater((state) => ({ ...state, expanded: !state.expanded }));
    readonly open = this.updater((state, content: SidebarContentType) => ({ ...state, content }));
    readonly toggleContent = this.updater((state, content: SidebarContent) =>
        state.expanded ? (areEqual(state.content, content) ? { ...state, expanded: false } : { ...state, content }) : { ...state, expanded: true, content }
    );
}
