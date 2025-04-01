import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { PresetService } from '@contezza/content-services/presets/shared';
import { AsyncPipe, JsonPipe } from '@angular/common';
import { Observable } from 'rxjs';

@Component({
    standalone: true,
    imports: [MatDialogModule, AsyncPipe, JsonPipe],
    selector: 'contezza-search-presets-preset-details',
    template: ` <pre><code> {{ json$ | async | json }} </code></pre> `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PresetDetailsComponent {
    @Input()
    set presetId(value: string) {
        this.json$ = this.presetService.getContent(value);
    }

    json$!: Observable<object>;

    constructor(private readonly presetService: PresetService) {}
}
