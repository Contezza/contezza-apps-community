import { Injectable } from '@angular/core';

import { Observable, take } from 'rxjs';

import { ContentActionRef } from '@alfresco/adf-extensions';

import { ActionsService, ActionTrigger } from './actions.service';
import { ContextMenuOverlayService } from './context-menu-overlay.service';

@Injectable()
export class ContextMenuService {
    static readonly PROVIDER = [ActionsService, ContextMenuService];

    readonly actions$: Observable<ContentActionRef[]> = this.actionsService.actions$;

    constructor(
        private readonly overlay: ContextMenuOverlayService,
        private readonly actionsService: ActionsService,
    ) {}

    init(config: { key?: string } | { actions: ContentActionRef[] } = {}) {
        if ('actions' in config) {
            this.actionsService.actions = config.actions;
        } else {
            this.actionsService.featureKey = config.key || 'contextMenu';
        }
        this.actionsService.trigger = ActionTrigger.CONTEXT_MENU;
    }

    open(event: MouseEvent) {
        // actions snapshot otherwise:
        // if a second context menu is opened while a first one is still open, then the new action list is shown in the first context menu before it is closed
        this.actions$.pipe(take(1)).subscribe(actions => {
            const contextMenu = this.overlay.open(actions, event);
            contextMenu.actionClicked.subscribe(action => this.runAction(action));
        });
    }

    runAction(action: ContentActionRef) {
        const clickAction = action.actions?.click;
        if (clickAction) {
            this.actionsService.runActionById(clickAction);
        }
    }
}
