import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTableModule } from '@angular/material/table';

import { TranslatePipe } from '@ngx-translate/core';

import { RmauditlogEntryChangedValue } from '@contezza/alfresco/rm/apis';

@Component({
    standalone: true,
    imports: [MatExpansionModule, MatTableModule, TranslatePipe],
    selector: 'contezza-alfresco-rm-rmaudilog-changed-values',
    template: `<mat-expansion-panel>
        <mat-expansion-panel-header>{{ 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.CHANGED_VALUES.LABEL' | translate }}</mat-expansion-panel-header>
        <table mat-table [dataSource]="changedValues()" style="width:100%;table-layout: fixed">
            @for (column of columns; track column.key) {
                <ng-container [matColumnDef]="column.key">
                    <th mat-header-cell *matHeaderCellDef>{{ column.label | translate }}</th>
                    <td mat-cell *matCellDef="let element">
                        {{ element[column.key] || '-' }}
                    </td>
                </ng-container>
            }

            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let _row; columns: displayedColumns"></tr>
        </table>
    </mat-expansion-panel>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChangedValuesComponent {
    // inputs
    readonly changedValues = input.required<RmauditlogEntryChangedValue[]>();

    readonly columns: { label: string; key: keyof RmauditlogEntryChangedValue }[] = [
        {
            label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.CHANGED_VALUES.PROPERTIES.NAME',
            key: 'name',
        },
        {
            label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.CHANGED_VALUES.PROPERTIES.PREVIOUS',
            key: 'previous',
        },
        {
            label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.CHANGED_VALUES.PROPERTIES.NEW',
            key: 'new',
        },
    ];
    readonly displayedColumns = this.columns.map(_ => _.key);
}
