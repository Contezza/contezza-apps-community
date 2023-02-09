import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output } from '@angular/core';
import { Store } from '@ngrx/store';
import { MaterialTableColumnData } from '../material-table-interfaces';

@Component({
    selector: 'contezza-material-table-actions-column',
    template: `
        <ng-container *ngIf="data?.actions">
            <button
                mat-icon-button
                #menuTrigger="matMenuTrigger"
                [matMenuTriggerFor]="menu"
                [matMenuTriggerData]="{ element: this.data.element }"
                (menuOpened)="menuTriggert.emit(menuTrigger.menuOpen)"
                (menuClosed)="menuTriggert.emit(menuTrigger.menuOpen)"
            >
                <adf-icon value="more_vert"></adf-icon>
            </button>

            <mat-menu #menu="matMenu">
                <ng-template matMenuContent let-item="element">
                    <ng-container *ngFor="let action of data.actions">
                        <button mat-menu-item (click)="store.dispatch({ type: action.action, payload: item })">
                            <adf-icon [value]="action.icon"></adf-icon>
                            <span>{{ action.title | translate }}</span>
                        </button>
                    </ng-container>
                </ng-template>
            </mat-menu>
        </ng-container>
    `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MaterialTableActionsColumnComponent {
    @Input()
    data: MaterialTableColumnData;

    @Output()
    menuTriggert = new EventEmitter<boolean>();

    constructor(readonly store: Store<any>) {}
}
