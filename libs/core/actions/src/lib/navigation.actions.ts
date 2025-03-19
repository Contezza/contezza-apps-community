import { createAction, props } from '@ngrx/store';

import { FavoriteEntry, NodeEntry, Site } from '@alfresco/js-api';

enum Type {
    NAVIGATE_TO = '[CORE] NAVIGATE_TO',
    NAVIGATE_TO_FOLDER = '[CORE] NAVIGATE_TO_FOLDER',
    NAVIGATE_TO_LIBRARY = '[CORE] NAVIGATE_TO_LIBRARY',
    NAVIGATE_TO_FAVORITE_FOLDER = '[CORE] NAVIGATE_TO_FAVORITE_FOLDER',
}

export const navigateTo = createAction(Type.NAVIGATE_TO, props<{ payload?: NodeEntry }>());
export const navigateToFolder = createAction(Type.NAVIGATE_TO_FOLDER, props<{ payload?: NodeEntry }>());
export const navigateToLibrary = createAction(Type.NAVIGATE_TO_LIBRARY, props<{ payload?: { entry: Pick<Site, 'guid'> } }>());
export const navigateToFavoriteFolder = createAction(Type.NAVIGATE_TO_FAVORITE_FOLDER, props<{ payload?: FavoriteEntry }>());
