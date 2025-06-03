import { FormatterSource } from '@contezza/core/extensions';

export interface IDynamicComponent<TData = any> {
    id: string;
    data?: TData;
}

type ExtendedIDynamicComponent<TData = any> = string | IDynamicComponent<TData>;

export interface ExtendedResultSettings {
    nameFormatter?: FormatterSource;
    thumbnailComponent?: ExtendedIDynamicComponent;
    locationComponent?: ExtendedIDynamicComponent;
}

export interface ResultSettings {
    nameFormatter: FormatterSource;
    thumbnailComponent: IDynamicComponent;
    locationComponent: IDynamicComponent;
}

export const DEFAULT_RESULT_SETTINGS: ResultSettings = {
    nameFormatter: { key: 'name' },
    thumbnailComponent: { id: 'columns.thumbnail' },
    locationComponent: { id: 'columns.site' },
};

export function formatResultSettings(settings?: ExtendedResultSettings): ResultSettings {
    if (!settings) {
        return DEFAULT_RESULT_SETTINGS;
    }
    const { nameFormatter, thumbnailComponent, locationComponent } = settings;
    const partialSettings: Partial<ResultSettings> = {
        nameFormatter,
        thumbnailComponent: typeof thumbnailComponent === 'string' ? { id: thumbnailComponent } : thumbnailComponent,
        locationComponent: typeof locationComponent === 'string' ? { id: locationComponent } : locationComponent,
    };
    return { ...DEFAULT_RESULT_SETTINGS, ...Object.fromEntries(Object.entries(partialSettings).filter(([_, v]) => v !== undefined)) };
}
