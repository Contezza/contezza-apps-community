import { createAction, props } from '@ngrx/store';

enum Type {
    ShowDetails = '[PROCESS_SERVICES] SHOW_DETAILS',
}

export const showDetails = createAction(Type.ShowDetails, props<{ properties: any }>());
