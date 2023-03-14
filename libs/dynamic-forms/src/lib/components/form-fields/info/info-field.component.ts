import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { ContezzaDynamicForm } from '@contezza/dynamic-forms/shared';

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
        this.valueSource = ContezzaDynamicForm.getValueSource(this.field);
    }
}
