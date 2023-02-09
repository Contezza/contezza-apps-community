import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';

@Component({
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
