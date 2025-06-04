import { Injectable } from '@angular/core';

import { ExtensionElement, ExtensionService as AdfExtensionService } from '@alfresco/adf-extensions';

import { ComponentResolver, DynamicComponentExtensionService } from '@contezza/core/dynamic-component/shared';
import { AdfUtils } from '@contezza/core/utils';

import { Column, IActionComponent, IColumnComponent, PropertyDisplay } from '../models';

type ExtensionPropertyDisplay = ExtensionElement & PropertyDisplay;

@Injectable({ providedIn: 'root' })
export class ExtensionService {
    static readonly MODULE_ID = 'content-services';

    private static readonly FEATURE_KEY_COLUMNS = 'columns';
    private static readonly FEATURE_KEY_PROPERTY_DISPLAY_LISTS = 'propertyDisplayLists';

    private _propertyDisplayLists?: Record<string, ExtensionPropertyDisplay[]>;
    private get propertyDisplayLists() {
        return (this._propertyDisplayLists ??= this.extensions.getFeature<Record<string, ExtensionPropertyDisplay[]>>(ExtensionService.FEATURE_KEY_PROPERTY_DISPLAY_LISTS, {}));
    }

    private _columns?: { id: string; columns: Column[] }[];
    private get columns() {
        return (this._columns ??= this.extensions.getFeature<{ id: string; columns: Column[] }[]>(ExtensionService.FEATURE_KEY_COLUMNS, []));
    }

    constructor(private readonly extensions: AdfExtensionService, private readonly dc: DynamicComponentExtensionService) {}

    /**
     * Wraps {@link AdfExtensionService}`.setComponents` while checking that the given components implement the {@link IActionComponent} interface.
     * Please follow this name convention for action-component ids:
     * <code>
     * <module>.<submodules?>.actions.<component-name>
     * </code>
     * where `component-name` is the component class name without suffix 'ActionComponent' in kebab-case,
     * e.g. the `component-name` of `ToggleViewActionComponent` is `toggle-view`.
     *
     * N.B.: even though the signature is the same as `setColumns`, action components are *not* lazy loaded.
     *
     * @param actions
     */
    setActions<TData>(actions: Record<string, ComponentResolver<IActionComponent<TData>>>) {
        Object.entries(actions).forEach(([key, resolver]) => {
            resolver().then((c) =>
                this.extensions.setComponents({
                    [key]: c,
                })
            );
        });
    }

    /**
     * Wraps {@link DynamicComponentExtensionService}`.setComponents` while checking that the given components implement the {@link IColumnComponent} interface.
     * Please follow this name convention for column-component ids:
     * <code>
     * <module>.<submodules?>.columns.<component-name>
     * </code>
     * where `component-name` is the component class name without suffix 'ColumnComponent' in kebab-case,
     * e.g. the `component-name` of `ContextMenuColumnComponent` is `context-menu`.
     *
     * @param columns
     */
    setColumns(columns: Record<string, ComponentResolver<IColumnComponent<any, any>>>) {
        this.dc.setComponents(columns);
    }

    getPropertyDisplayListById<T extends ExtensionPropertyDisplay>(id: string): T[] | undefined {
        const preset = (this.propertyDisplayLists[id] ?? this.columns.find((columnPreset) => columnPreset.id === id)?.columns) as T[] | undefined;
        return preset && AdfUtils.filterAndSortFeature(preset);
    }
}

export { ExtensionService as ContentServicesExtensionService };
