import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatDialogConfig } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';

import { TranslateModule } from '@ngx-translate/core';

import { Subject } from 'rxjs';
import { filter, shareReplay, takeUntil, throttleTime } from 'rxjs/operators';

import { DialogLoaderService } from '@contezza/core/dialogs';
import { DisplayWithPipe } from '@contezza/core/pipes';
import { ContezzaStringTemplate } from '@contezza/core/utils';
import { DynamicFormDialogData, ExtendedDynamicFormDefinition } from '@contezza/dynamic-forms/shared';
import { ContezzaIdResolverService } from '@contezza/core/extensions';

import { ContezzaDynamicFormFieldErrorModule } from '../../dynamic-form-field-error';
import { ContezzaBaseFieldComponent } from '../base-field.component';

type Settings = {
    /**
     * Whether the form value is an array.
     */
    multiple?: boolean;
    /**
     * Only used if the form value is an array. Whether the dialog returns a new array form value or a new array item.
     */
    embedded?: boolean;
    matDialogConfig?: Omit<MatDialogConfig, 'data'>;
} & ({ labelTemplate: string } | { labelMap: string });

@Component({
    standalone: true,
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatChipsModule,
        MatFormFieldModule,
        MatIconModule,
        MatInputModule,
        TranslateModule,
        ContezzaDynamicFormFieldErrorModule,
        DisplayWithPipe,
    ],
    selector: 'contezza-dialog-field',
    templateUrl: 'dialog.field.component.html',
    styles: [
        `
            ::ng-deep.mat-chip-list-wrapper {
                margin: unset !important;
            }
        `,
    ],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DialogFieldComponent<ValueType> extends ContezzaBaseFieldComponent<ValueType> implements OnInit {
    private readonly idResolver = inject(ContezzaIdResolverService);
    private readonly dialog = inject(DialogLoaderService);

    settings: Partial<DynamicFormDialogData> & Settings;
    displayFn: (value: ValueType) => string;
    dynamicFormId: ExtendedDynamicFormDefinition;

    readonly openDialog$ = new Subject<void>();

    ngOnInit() {
        super.ngOnInit();

        this.settings = this.field.settings as any;
        if ('labelTemplate' in this.settings) {
            const labelTemplate = new ContezzaStringTemplate<ValueType>(this.settings.labelTemplate);
            this.displayFn = (value) => (value ? labelTemplate.evaluate(value) : '');
        } else {
            const labelMap = this.idResolver.resolve(this.settings.labelMap, 'map');
            this.displayFn = (value) => (value ? labelMap(value) : '');
        }

        this.dynamicFormId = {
            ...(typeof this.settings.dynamicFormId === 'string'
                ? { id: this.settings.dynamicFormId }
                : {
                      id: this.settings.dynamicFormId.id,
                      layoutId: this.settings.dynamicFormId.layoutId,
                  }),
            providedDependencies: Object.entries(this.field.extras || {}).reduce((acc, [key, dep]) => {
                acc[key] = dep.pipe(shareReplay());
                return acc;
            }, {}),
        };

        // throttle because focusin event fires twice in firefox
        this.openDialog$.pipe(throttleTime(1000), takeUntil(this.destroy$)).subscribe(() => this.openDialog());
    }

    openDialog() {
        if (this.settings?.dynamicFormId) {
            this.dialog
                .open(() => import('../../dynamic-form-dialog').then((m) => m.DynamicFormDialogComponent), {
                    ...(this.settings.matDialogConfig || {}),
                    data: {
                        title: this.settings.title ?? this.field.label,
                        buttons: { cancel: this.settings.buttons?.cancel || 'APP.BUTTONS.CANCEL', submit: this.settings.buttons?.submit || 'APP.BUTTONS.OK' },
                        dynamicFormId: this.dynamicFormId,
                    },
                })
                .pipe(filter((response) => !!response))
                .subscribe((response) => {
                    const { multiple, embedded } = this.settings;
                    if (multiple) {
                        if (embedded) {
                            this.control.setValue(response[this.field.id]);
                        } else {
                            const value = this.control.value || [];
                            value.push(response);
                            this.control.setValue(value);
                        }
                    } else {
                        this.control.setValue(response);
                    }
                });
        }
    }

    remove(chip: ValueType) {
        const value: ValueType[] = this.control.value || [];
        const index = value.findIndex((item) => item === chip);
        if (index > -1) {
            value.splice(index, 1);
            this.control.setValue(value);
        }
    }
}
