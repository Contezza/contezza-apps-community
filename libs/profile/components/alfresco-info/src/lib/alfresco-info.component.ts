import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatTableModule } from '@angular/material/table';
import { MatToolbar } from '@angular/material/toolbar';

import { TranslatePipe } from '@ngx-translate/core';

import { map } from 'rxjs';

import { ContentApiService } from '@alfresco/aca-shared';
import { ModuleInfo } from '@alfresco/js-api';

@Component({
    standalone: true,
    imports: [CommonModule, TranslatePipe, MatToolbar, MatTableModule],
    selector: 'contezza-profile-alfresco-info',
    templateUrl: 'alfresco-info.component.html',
    styles: [
        `
            :host {
                display: flex !important;
                flex-direction: column;
                gap: 16px;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlfrescoInfoComponent {
    // constructor
    private readonly contentApi = inject(ContentApiService);

    readonly repository = toSignal(this.contentApi.getRepositoryInformation().pipe(map(node => node.entry.repository)));

    licenseColumns = [
        {
            columnDef: 'property',
            header: 'APP.ABOUT.LICENSE.PROPERTY',
            cell: (row: { key: string }) => `${row.key}`,
        },
        {
            columnDef: 'value',
            header: 'APP.ABOUT.LICENSE.VALUE',
            cell: (row: { value: any }) => `${row.value}`,
        },
    ];

    modulesColumns = [
        {
            columnDef: 'id',
            header: 'APP.ABOUT.MODULES.ID',
            cell: (row: ModuleInfo) => `${row.id}`,
        },
        {
            columnDef: 'title',
            header: 'APP.ABOUT.MODULES.NAME',
            cell: (row: ModuleInfo) => `${row.title}`,
        },
        {
            columnDef: 'version',
            header: 'APP.ABOUT.MODULES.VERSION',
            cell: (row: ModuleInfo) => `${row.version}`,
        },
    ];

    displayedLicenseColumns = this.licenseColumns.map(x => x.columnDef);
    displayedModulesColumns = this.modulesColumns.map(x => x.columnDef);

    keepOrder = () => 0;
}
