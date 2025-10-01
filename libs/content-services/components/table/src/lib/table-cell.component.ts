import { ChangeDetectionStrategy, Component, HostBinding, HostListener, Input, OnInit, Optional } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

import { Store } from '@ngrx/store';

import { Observable, of, tap } from 'rxjs';

import { IconModule } from '@alfresco/adf-core';
import { DynamicExtensionComponent } from '@alfresco/adf-extensions';

import { SelectionStore } from '@contezza/core/context';
import { ContezzaLetDirective } from '@contezza/core/directives';
import { DynamicComponent, IsDefinedPipe } from '@contezza/core/dynamic-component';
import { Column } from '@contezza/content-services/shared';
import { TableCellService } from '@contezza/content-services/components/table/shared';

import { DynamicTableCellDirective } from './dynamic-table-cell.directive';

@Component({
    standalone: true,
    imports: [CommonModule, MatIconModule, IconModule, DynamicExtensionComponent, ContezzaLetDirective, DynamicComponent, IsDefinedPipe, DynamicTableCellDirective],
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'td[contezza-table-cell]',
    template: `
        <ng-container *ngIf="column.template">
            <ng-container *ngIf="column.template | isDefined; else adfDc">
                <contezza-dynamic-component [id]="column.template" [data]="{ item, column }" />
            </ng-container>
            <ng-template #adfDc>
                <adf-dynamic-component contezza-dynamic-table-cell [id]="column.template" [data]="this" />
            </ng-template>
        </ng-container>
        <ng-container *ngIf="!column.template">
            <ng-container *contezzaLet="value$ | async as value">
                <ng-container [ngSwitch]="column.type">
                    <ng-container *ngSwitchCase="'thumbnail'">
                        <div style="width:30px">
                            <ng-container *ngIf="column.format === 'withSelection' && (isSelected$ | async); else thumbnail">
                                <mat-icon class="contezza-table-cell-selected" svgIcon="selected" />
                            </ng-container>
                            <ng-template #thumbnail>
                                <ng-container *ngIf="value.startsWith('./assets'); else adfIcon">
                                    <img [src]="value" alt="" style="vertical-align: middle" />
                                </ng-container>
                                <ng-template #adfIcon>
                                    <adf-icon color="primary" [value]="value" />
                                </ng-template>
                            </ng-template>
                        </div>
                    </ng-container>
                    <ng-container *ngSwitchDefault>{{ value }}</ng-container>
                </ng-container>
            </ng-container>
        </ng-container>
    `,
    styles: [
        `
            td[contezza-table-cell] img {
                pointer-events: none;
            }
            :host .contezza-table-cell-selected,
            td[contezza-table-cell] .contezza-table-cell-selected {
                height: 100%;
                width: 100%;
                margin: 3px 0 0 -2px;
                overflow: unset !important;
            }
            ::ng-deep td[contezza-table-cell] .contezza-table-cell-selected > svg {
                fill: var(--theme-accent-color);
                width: 30px;
                height: 30px;
            }
            :host.clickable {
                cursor: pointer;
            }
            :host.clickable:hover {
                text-decoration: underline;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DatePipe],
})
export class TableCellComponent<ItemType> implements OnInit {
    @Input()
    item: ItemType;

    @Input()
    column: Column;

    @HostBinding('class')
    hostClass: string;

    @HostBinding('title')
    hostTitle = '';

    @HostBinding('class.clickable')
    clickable: boolean;

    @HostListener('click', ['$event'])
    onClick(event: MouseEvent) {
        const type = this.column.actions?.click;
        if (type) {
            event.stopPropagation();
            this.store.dispatch({ type, payload: this.item });
        }
    }

    value$: Observable<string>;

    isSelected$: Observable<boolean>;

    constructor(private readonly store: Store, @Optional() private readonly selection: SelectionStore<ItemType>, private readonly service: TableCellService<ItemType>) {}

    ngOnInit() {
        this.hostClass = this.column.class;
        this.clickable = !!this.column.actions?.click;
        this.value$ = this.service.getValue(this.item, this.column).pipe(tap((value) => (this.hostTitle = value)));

        this.isSelected$ = this.selection?.selected$(this.item) || of(false);
    }
}
