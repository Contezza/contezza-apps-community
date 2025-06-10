import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';

import { TranslateModule } from '@ngx-translate/core';

import { Store } from '@ngrx/store';

import { defer, startWith } from 'rxjs';

import { ContentActionRef, ContentActionType, mergeObjects } from '@alfresco/adf-extensions';
import { ToolbarActionComponent } from '@alfresco/aca-shared';
import { SnackbarErrorAction } from '@alfresco/aca-shared/store';

import { ContezzaLetDirective } from '@contezza/core/directives';
import { TranslatePropertyTitlePipe } from '@contezza/core/property-titles';
import { DeepPartial } from '@contezza/core/utils';

import { ContezzaBaseFieldComponent } from '../base-field.component';

interface Settings {
    multiple: boolean;
    accept?: string;
    uploadAction: ContentActionRef;
}

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        TranslateModule,
        ToolbarActionComponent,
        ContezzaLetDirective,
        TranslatePropertyTitlePipe,
    ],
    selector: 'contezza-dynamic-forms-upload-field',
    template: `<ng-container *contezzaLet="readonly$ | async as readonly">
        <ng-container *contezzaLet="controlValue$ | async as value">
            <aca-toolbar-action
                *ngIf="!readonly && (settings.multiple || !value?.length)"
                [actionRef]="settings.uploadAction"
                (keydown.enter)="upload.click()"
                (click)="$event.stopPropagation(); $event.preventDefault(); upload.click()"
            />
            <input #upload style="display: none" type="file" [multiple]="settings.multiple" [accept]="settings.accept" (change)="onFileChange($event)" />
            <mat-form-field *ngIf="value?.length" [class.mat-form-field-disabled]="readonly" floatLabel="auto" [appearance]="field.settings?.appearance">
                <mat-label *ngIf="field.label">
                    <ng-container *ngIf="field.label | translatePropertyTitle as label$; else translatedLabel">
                        {{ label$ | async }}
                    </ng-container>
                    <ng-template #translatedLabel>
                        {{ field.label | translate }}
                    </ng-template>
                </mat-label>
                <mat-chip-grid #chipList [formControl]="control" [required]="required">
                    <mat-chip-row *ngFor="let chip of value || []" [removable]="!readonly" (removed)="remove(chip)">
                        {{ chip.name }}
                        <mat-icon matChipRemove *ngIf="!readonly">cancel</mat-icon>
                    </mat-chip-row>
                    <input spellcheck="false" data-lpignore="true" [matChipInputFor]="chipList" style="display: none" />
                </mat-chip-grid>
            </mat-form-field>
        </ng-container>
    </ng-container>`,
    styles: [
        `
            :host {
                display: flex;
                align-items: center;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UploadFieldComponent extends ContezzaBaseFieldComponent<File, File[]> implements OnInit {
    static readonly ACTION_UPLOAD_ID = 'upload';
    static readonly DEFAULT_SETTINGS: Settings = {
        multiple: false,
        uploadAction: {
            id: UploadFieldComponent.ACTION_UPLOAD_ID,
            icon: 'upload',
            type: ContentActionType.button,
        },
    };

    readonly controlValue$ = defer(() => this.control.valueChanges.pipe(startWith(this.control.value)));

    // constructor
    private readonly store = inject(Store);

    settings!: Settings;

    onFileChange(event: Event) {
        // extract files from event
        const targetFiles = (event.target as HTMLInputElement).files;
        if (targetFiles?.length) {
            const files = Array.from(targetFiles);
            // check allowed mimetype
            if (this.settings.accept === undefined || files.every((file) => this.settings.accept!.split(',').includes(file.type))) {
                const value = this.control.value || [];
                value.push(...Array.from(files));
                // spread because otherwise there is no change
                this.control.setValue([...value]);
            } else {
                this.store.dispatch(new SnackbarErrorAction('CONTEZZA.MESSAGES.ERRORS.FILE_MIMETYPE_INVALID'));
            }
        }
    }

    ngOnInit() {
        super.ngOnInit();

        this.settings = mergeObjects(UploadFieldComponent.DEFAULT_SETTINGS, (this.field.settings || {}) as DeepPartial<Settings>);
    }

    remove(file: File) {
        const value: File[] = this.control.value || [];
        const index = value.findIndex((x) => x === file);
        if (index > -1) {
            value.splice(index, 1);
        }
        // spread because otherwise there is no change
        this.control.setValue([...value]);
    }
}
