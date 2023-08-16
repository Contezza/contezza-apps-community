import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';
import { startWith } from 'rxjs/operators';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-info-field',
    templateUrl: './info-field.component.html',
    styleUrls: ['./info-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InfoFieldComponent extends ContezzaBaseFieldComponent<string> implements OnInit {
    valueSource: Observable<string>;

    ngOnInit() {
        super.ngOnInit();
        this.valueSource = this.control.valueChanges.pipe(startWith(this.control.value));
    }
}
