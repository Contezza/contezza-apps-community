import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

import { MAT_MENU_DEFAULT_OPTIONS } from '@angular/material/menu';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';

import { ActionsService } from '@contezza/core/context';

@Component({
    selector: 'contezza-floating-button',
    templateUrl: './floating-button.component.html',
    styles: [
        `
            :host {
                position: absolute;
                bottom: 70px;
                right: 40px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [ActionsService.provider, { provide: MAT_MENU_DEFAULT_OPTIONS, useValue: { xPosition: 'before', yPosition: 'above' } }],
})
export class FloatingButtonComponent implements OnInit {
    private readonly actions$: Observable<ContentActionRef[]> = this.actionsService.actions$;
    readonly action$: Observable<ContentActionRef> = this.actions$.pipe(
        map((actions) => {
            if (actions?.length) {
                if (actions.length > 1) {
                    return {
                        id: 'app.floatingButton.more',
                        type: ContentActionType.menu,
                        order: 1,
                        icon: 'more_vert',
                        title: 'APP.ACTIONS.MORE',
                        children: actions,
                    };
                } else {
                    const recursion = (action) => (action.children?.length === 1 ? recursion({ ...action.children[0], ...(action.icon ? { icon: action.icon } : {}) }) : action);
                    return recursion(actions[0]);
                }
            } else {
                return undefined;
            }
        })
    );

    @Input()
    key = 'floatingButton';

    constructor(private readonly actionsService: ActionsService) {}

    ngOnInit() {
        this.actionsService.featureKey = this.key;
    }

    trackById(_, { id }: ContentActionRef) {
        return id;
    }

    runAction(action: ContentActionRef) {
        const clickAction = action.actions?.click;
        if (clickAction) {
            this.actionsService.runActionById(clickAction);
        }
    }
}
