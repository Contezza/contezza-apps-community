import { InjectionToken } from '@angular/core';

export type SelectionMouseAction<ItemType> = (item: ItemType) => void;

export const mouseActionKeys = ['click', 'ctrlClick', 'dblClick', 'rightClick', 'drag'] as const;

export type MouseActions<ItemType> = {
    [key in (typeof mouseActionKeys)[number]]: SelectionMouseAction<ItemType>;
};

const selectionReducerKeys = ['setSingleOrRemove', 'toggle', 'ifnSet', 'set'] as const;

export type SelectionReducers<ItemType> = {
    readonly [key in (typeof selectionReducerKeys)[number]]: SelectionMouseAction<ItemType>;
};

export type SelectionMouseActionsConfig<ItemType = any> = Partial<{
    [key in keyof MouseActions<ItemType>]: keyof SelectionReducers<ItemType>;
}>;

const defaultSelectionMouseActionsConfig: SelectionMouseActionsConfig = {
    click: 'setSingleOrRemove',
    ctrlClick: 'toggle',
    dblClick: 'set',
    rightClick: 'ifnSet',
    drag: 'ifnSet',
};

export const SELECTION_MOUSE_ACTIONS_CONFIG = new InjectionToken<SelectionMouseActionsConfig>('selection mouse actions config', {
    factory: () => defaultSelectionMouseActionsConfig,
});
