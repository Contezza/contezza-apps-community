import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-toggle-field',
    templateUrl: 'toggle-field.component.html',
    styleUrls: ['toggle-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToggleFieldComponent extends ContezzaBaseFieldComponent<boolean> implements OnInit {
    ngOnInit() {
        super.ngOnInit();
    }
}
