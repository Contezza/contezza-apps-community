import { ChangeDetectionStrategy, Component } from '@angular/core';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-textarea-field',
    templateUrl: './textarea-field.component.html',
    styleUrls: ['./textarea-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TextareaFieldComponent extends ContezzaBaseFieldComponent<string, string> {}
