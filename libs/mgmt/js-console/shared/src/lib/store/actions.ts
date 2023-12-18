import { createAction, props } from '@ngrx/store';

import { NodeEntry, SiteEntry } from '@alfresco/js-api';

enum Type {
    OpenNode = '[JS_CONSOLE] OPEN_NODE',
}

export const openNode = createAction(Type.OpenNode, props<{ payload?: NodeEntry | SiteEntry }>());
