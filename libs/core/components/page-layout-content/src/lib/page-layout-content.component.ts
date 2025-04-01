import { Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from '@alfresco/adf-core';

import { LayoutItem } from './layout-item.interface';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule, IconModule],
    selector: 'contezza-page-layout-content',
    templateUrl: './page-layout-content.component.html',
    styleUrls: ['./page-layout-content.component.scss'],
    encapsulation: ViewEncapsulation.None,
    host: {
        class: 'contezza-page-layout-content',
    },
})
export class ContezzaPageLayoutContentComponent {
    @Input()
    items: LayoutItem[];
}
