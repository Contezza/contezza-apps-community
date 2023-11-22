import { Router } from '@angular/router';

import { createAction, props } from '@ngrx/store';

enum Type {
    Navigate = '[CORE] NAVIGATE',
}

/**
 * Wraps `Router.navigate()`.
 */
export const navigate = createAction(Type.Navigate, props<{ payload: Parameters<Router['navigate']> }>());
