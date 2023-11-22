import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, MatIconModule, TranslateModule],
    selector: 'js-console-noderef',
    templateUrl: './js-console-noderef.component.html',
    styleUrls: ['./js-console-noderef.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class JsConsoleNoderefComponent {
    @Input()
    title: string;

    @Input()
    value: string;

    @Input()
    actionIcon?: string;

    @Input()
    secondActionIcon?: string;

    @Output()
    actionClick = new EventEmitter();

    @Output()
    secondActionClick = new EventEmitter();
}
