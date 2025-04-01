import { inject, Injectable } from '@angular/core';

import { Action } from '@ngrx/store';
import { FunctionIsNotAllowed } from '@ngrx/store/src/models';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { isInfoDrawerOpened } from '@alfresco/aca-shared/store';

import { ContezzaComponentStoreService } from '@contezza/core/context';
import { SidebarContentType, SidebarStore } from '@contezza/content-services/shared';
import { ActionsService } from '@contezza/content-services/search/components/search-table-layout/shared';

@Injectable()
export class CustomStoreService extends ContezzaComponentStoreService {
    private readonly actions: ActionsService<any> = inject(ActionsService, { optional: true });
    private readonly sidebar = inject(SidebarStore, { optional: true });

    protected doDispatch<ActionType extends Action = Action>(
        action: ActionType & FunctionIsNotAllowed<ActionType, 'Functions are not allowed to be dispatched. Did you forget to call the action creator function?'>
    ) {
        const { type } = action;
        if (this.actions?.[type]) {
            this.actions[type](this.components[0]);
        } else {
            super.doDispatch<ActionType>(action);
        }
    }

    select<K>(mapFn, ...args): Observable<K> {
        return mapFn === isInfoDrawerOpened && this.sidebar
            ? (this.sidebar.content$.pipe(map((content) => content === SidebarContentType.Info)) as unknown as Observable<K>)
            : super.select(mapFn, args);
    }
}
