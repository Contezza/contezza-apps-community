import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';

import { ExecuteConsoleResponse } from '../../../interfaces/js-console';

@Component({
    selector: 'contezza-js-console-output-js',
    templateUrl: './js-console-output-js.component.html',
    styleUrls: ['./js-console-output-js.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    encapsulation: ViewEncapsulation.None,
})
export class JsConsoleOutputJsComponent {
    @Input()
    output: ExecuteConsoleResponse;
}
