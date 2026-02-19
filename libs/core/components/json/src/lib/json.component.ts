import { JsonPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

/**
 * Wraps {@link JsonPipe} in a component.
 */
@Component({
    standalone: true,
    imports: [JsonPipe],
    selector: 'contezza-json',
    template: `<pre>{{ json() | json }}</pre>`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JsonComponent {
    // inputs
    readonly json = input.required<any>();
}
