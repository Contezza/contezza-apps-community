import { Inject, Injectable, Optional, Provider } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { Observable } from 'rxjs';

import { SelectionState as AlfrescoSelectionState } from '@alfresco/adf-extensions';

import { ContezzaAcaUtils, ContezzaArrayUtils } from '@contezza/core/utils';

import { AbstractItemDecoder, DefaultItemDecoder, ItemDecoder } from './item-decoder.service';
import {
    mouseActionKeys,
    MouseActions,
    SELECTION_MOUSE_ACTIONS_CONFIG,
    SelectionMouseAction,
    SelectionMouseActionsConfig,
    SelectionReducers,
} from './selection-mouse-actions.interface';

interface SelectionState<ItemType> {
    selection: ItemType[];
}

const initialState: SelectionState<any> = { selection: [] };

/**
 * To be provided as component service.
 * Manages the selection state of the component.
 * It is possible to fully customise the mapping between mouse actions on the component and store reducers.
 */
@Injectable()
export class SelectionStore<ItemType> extends ComponentStore<SelectionState<ItemType>> implements SelectionReducers<ItemType>, MouseActions<ItemType> {
    /**
     * Provides SelectionStore with the given configuration.
     *
     * @param config Configuration object. It consists of a mapping of standard mouse actions to selection reducers. Mouse actions are: `click`, `ctrlClick`, `dblClick`, `rightClick`, `drag`. Selection reducers are: `setSingleOrRemove`, `toggle`, `ifnSet`, `set`. Default configuration is `{ click: 'setSingleOrRemove', ctrlClick: 'toggle', dblClick: 'set', rightClick: 'ifnSet', drag: 'ifnSet' }`
     */
    static withConfig = (config: SelectionMouseActionsConfig): Provider => [{ provide: SELECTION_MOUSE_ACTIONS_CONFIG, useValue: config }, SelectionStore];

    // selectors
    readonly selection$ = this.select((state) => state.selection);
    readonly last$ = this.select(this.selection$, (selection) => (selection?.length > 0 ? selection[selection.length - 1] : undefined));
    /**
     * Emits true/false as the given item is selected/deselected.
     *
     * @param item
     */
    readonly selected$ = (item: ItemType) => this.select(this.selection$, (selection) => !!selection?.find((selectedItem) => this.decoder.areEqual(selectedItem, item)));
    /**
     * Emits the selected items converted into Alfresco NodeEntry's.
     */
    readonly selectedNodes$ = this.select(this.selection$, (selection) =>
        selection.map((item) => this.decoder.toNode(item)).map((entry) => ({ entry, isLibrary: 'guid' in entry }))
    );
    /**
     * Emits the selection state translated into Alfresco SelectionState.
     */
    readonly selectionState$: Observable<AlfrescoSelectionState> = this.select(this.selectedNodes$, (selection) => ContezzaAcaUtils.makeSelectionState(selection));

    // reducers
    /**
     * Sets the given item as the only selected item, unless this is already the case. If the given item is already the only selected item, removes it from the selection.
     * Default click action.
     */
    readonly setSingleOrRemove = this.updater((state, item: ItemType) => ({
        ...state,
        selection: state.selection.length !== 1 || !this.decoder.areEqual(state.selection[0], item) ? [item] : [],
    }));
    /**
     * If the given item is selected, removes it from the selection. If the given item is not selected, adds it to the selection.
     * Default ctrl + click action
     */
    readonly toggle = this.updater((state, item: ItemType) => {
        const selection = [...state.selection];
        const matchingItemIndex = selection.findIndex((selectedItem) => this.decoder.areEqual(selectedItem, item));
        if (matchingItemIndex >= 0) {
            selection.splice(matchingItemIndex, 1);
        } else {
            selection.push(item);
        }
        return { ...state, selection };
    });
    /**
     * If the given item is not selected, sets the selection to that item only.
     * Default right click action.
     */
    readonly ifnSet = this.updater((state, item: ItemType) => ({
        ...state,
        ...(state.selection.find((selectedItem) => this.decoder.areEqual(selectedItem, item)) ? {} : { selection: [item] }),
    }));
    /**
     * Adds item(s) to current selection.
     */
    readonly add = this.updater((state, items: ItemType | ItemType[]) => ({
        ...state,
        selection: state.selection.concat(ContezzaArrayUtils.asArray(items).filter((item) => !state.selection.find((item2) => this.decoder.areEqual(item2, item)))),
    }));
    /**
     * Removes item(s) from current selection.
     */
    readonly remove = this.updater((state, items: ItemType | ItemType[]) => ({
        ...state,
        selection: state.selection.filter((item) => !ContezzaArrayUtils.asArray(items).find((item2) => this.decoder.areEqual(item2, item))),
    }));
    /**
     * Sets the given item(s) as selection.
     */
    readonly set = this.updater((state, selection: ItemType | ItemType[]) => ({ ...state, selection: ContezzaArrayUtils.asArray(selection) }));
    /**
     * Resets the selection to empty.
     */
    readonly reset = this.updater(() => initialState);

    private readonly decoder: AbstractItemDecoder<ItemType>;

    click: SelectionMouseAction<ItemType>;
    ctrlClick: SelectionMouseAction<ItemType>;
    dblClick: SelectionMouseAction<ItemType>;
    rightClick: SelectionMouseAction<ItemType>;
    drag: SelectionMouseAction<ItemType>;

    constructor(@Inject(SELECTION_MOUSE_ACTIONS_CONFIG) config: SelectionMouseActionsConfig, @Optional() _decoder?: ItemDecoder<ItemType>) {
        super(initialState);
        mouseActionKeys.forEach((key) => (this[key] = (item: ItemType) => (config[key] ? this[config[key]]?.(item) : undefined)));
        this.decoder = _decoder || new DefaultItemDecoder();
    }
}
