import { ContezzaDynamicSearchForm } from '@contezza/dynamic-forms/shared';
import { PresetType } from '../models';

import { createAction, props } from '@ngrx/store';

enum Type {
    LoadPresets = '[CONTENT_SERVICES.PRESETS] LOAD_PRESETS',
    LoadPreset = '[CONTENT_SERVICES.PRESETS] LOAD_PRESET',
    SavePreset = '[CONTENT_SERVICES.PRESETS] SAVE_PRESET',

    ShowDetails = '[CONTENT_SERVICES.PRESETS] SHOW_DETAILS',
    UpdateTitle = '[CONTENT_SERVICES.PRESETS] UPDATE_TITLE',
    SaveNewVersion = '[CONTENT_SERVICES.PRESETS] SAVE_NEW_VERSION',
    Remove = '[CONTENT_SERVICES.PRESETS] REMOVE',
}

export const savePreset = createAction(
    Type.SavePreset,
    props<{ payload: { forms: Array<{ form: ContezzaDynamicSearchForm; type: PresetType }>; options: { preferencesId: string; global: boolean } } }>()
);

export const loadPresets = createAction(Type.LoadPresets, props<{ payload: { preferencesId: string } }>());

export const loadPreset = createAction(
    Type.LoadPreset,
    props<{ payload: { presetId: string; forms: Array<{ form: ContezzaDynamicSearchForm; type: PresetType }>; options: { preferencesId: string } } }>()
);

export const showDetails = createAction(Type.ShowDetails, props<{ payload: { presetId: string } }>());
export const updateTitle = createAction(Type.UpdateTitle, props<{ payload: { presetId: string } }>());
export const saveNewVersion = createAction(
    Type.SaveNewVersion,
    props<{ payload: { presetId: string; forms: Array<{ form: ContezzaDynamicSearchForm; type: PresetType }>; options: { preferencesId: string } } }>()
);
export const remove = createAction(Type.Remove, props<{ payload: { presetId: string } }>());
