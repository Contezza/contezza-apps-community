import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-checkbox-field',
    templateUrl: './checkbox-field.component.html',
    styleUrls: ['./checkbox-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldComponent extends ContezzaBaseFieldComponent<boolean> implements OnInit {}
