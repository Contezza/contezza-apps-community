import { ChangeDetectionStrategy, Component, Input, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { ExecuteConsoleResponse } from '../../../interfaces/js-console';

@Component({
    standalone: true,
    imports: [CommonModule, TranslateModule],
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
