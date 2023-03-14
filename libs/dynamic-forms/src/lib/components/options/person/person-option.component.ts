import { ChangeDetectionStrategy, Component, OnInit, ViewEncapsulation } from '@angular/core';

import { BaseOptionComponent } from '../base-option.component';
import { User } from '@alfresco/adf-core';

@Component({
    selector: 'contezza-person-option',
    templateUrl: './person-option.component.html',
    styleUrls: ['./person-option.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class PersonOptionComponent<ValueType extends User & { avatar: string }> extends BaseOptionComponent<ValueType> implements OnInit {
    displayName: string;

    ngOnInit() {
        this.displayName = (this.value.id ? this.value.displayName : `${this.value.firstName || ''} ${this.value.lastName || ''}`).trim();
    }
}
