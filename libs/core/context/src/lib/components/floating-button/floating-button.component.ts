import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MAT_MENU_DEFAULT_OPTIONS, MatMenuModule } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ContentActionRef, ContentActionType, DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { IconDirective } from '@contezza/core/directives';

import { ActionsService } from '../../services';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatDividerModule, MatIconModule, MatMenuModule, TranslateModule, DynamicExtensionComponent, IconDirective],
    selector: 'contezza-floating-button',
    templateUrl: 'floating-button.component.html',
    styleUrls: ['floating-button.component.scss'],
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

    @Input()
    actions?: ContentActionRef[];

    constructor(private readonly actionsService: ActionsService) {}

    ngOnInit() {
        if (this.actions) {
            this.actionsService.actions = this.actions;
        } else {
            this.actionsService.featureKey = this.key;
        }
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
