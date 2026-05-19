import { Clipboard } from '@angular/cdk/clipboard';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { MatIconButton } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
    standalone: true,
    imports: [MatFormFieldModule, MatIcon, MatIconButton, MatInputModule],
    selector: 'contezza-share-links',
    template: `@for (link of links(); track link) {
        <mat-form-field class="adf-full-width adf-float-label show-links-dialog-link" floatLabel="always">
            <input data-automation-id="adf-share-link" class="adf-share-link__input" matInput [value]="link" readonly />
            <button type="button" mat-icon-button matSuffix (click)="copyToClipboard(link)">
                <mat-icon>content_copy</mat-icon>
            </button>
        </mat-form-field>
    }`,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LinksComponent {
    // constructor
    private readonly clipboard = inject(Clipboard);

    // inputs
    readonly links = input.required<string[]>();

    copyToClipboard(text: string) {
        this.clipboard.copy(text);
    }
}
