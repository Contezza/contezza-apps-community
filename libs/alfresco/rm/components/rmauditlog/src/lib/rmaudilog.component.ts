import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { Rmauditlog, RmauditlogEntry } from '@contezza/alfresco/rm/apis';

import { ChangedValuesComponent } from './changed-values.component';

@Component({
    standalone: true,
    imports: [TranslatePipe, ChangedValuesComponent],
    selector: 'contezza-alfresco-rm-rmaudilog',
    template: `@for (entry of rmauditlog().entries; track entry) {
        <div class="contezza-alfresco-rm-rmaudilog-item">
            @for (list of propertyLists; track list) {
                <div class="contezza-alfresco-rm-rmaudilog-item-row">
                    @for (x of list; track x.key) {
                        <div class="contezza-alfresco-rm-rmaudilog-item-row-property">
                            <span class="contezza-alfresco-rm-rmaudilog-item-row-property-label">{{ x.label | translate }}:</span>
                            <span class="contezza-alfresco-rm-rmaudilog-item-row-property-value">{{ entry[x.key] }}</span>
                        </div>
                    }
                </div>
            }
            @if (!!entry.changedValues.length) {
                <contezza-alfresco-rm-rmaudilog-changed-values [changedValues]="entry.changedValues" />
            }
        </div>
    }`,
    styleUrls: ['rmaudilog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RmaudilogComponent {
    // inputs
    readonly rmauditlog = input.required<Rmauditlog>();

    readonly propertyLists: {
        label: string;
        key: keyof RmauditlogEntry;
    }[][] = [
        [
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.TIMESTAMP',
                key: 'timestamp',
            },
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.FULL_NAME',
                key: 'fullName',
            },
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.EVENT',
                key: 'event',
            },
        ],
        [
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.IDENTIFIER',
                key: 'identifier',
            },
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.NODE_TYPE',
                key: 'nodeType',
            },
            {
                label: 'ALFRESCO.RM.RMAUDITLOG.PROPERTIES.PATH',
                key: 'path',
            },
        ],
    ];
}
