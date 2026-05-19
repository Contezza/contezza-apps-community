import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButton } from '@angular/material/button';
import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSlideToggle } from '@angular/material/slide-toggle';
import { MomentDateAdapter } from '@angular/material-moment-adapter';

import { TranslatePipe } from '@ngx-translate/core';

import { filter, startWith } from 'rxjs';

import moment, { Moment } from 'moment';

import { UserPreferencesService, UserPreferenceValues } from '@alfresco/adf-core';
import { Node } from '@alfresco/js-api';

import { DialogTitle, DialogTitleComponent } from '@contezza/core/dialogs';
import { TRANSLATE } from '@contezza/core/translate';
import { DATE_FORMATS } from '@contezza/core/utils';

import { Channel, EndDateType, ExtensionService, LinkType, ShareSettings } from '@contezza/content-services/share/shared';

@Component({
    standalone: true,
    imports: [
        DialogTitleComponent,
        MatDialogModule,
        TranslatePipe,
        MatButton,
        ReactiveFormsModule,
        MatRadioModule,
        MatSlideToggle,
        MatFormFieldModule,
        MatInputModule,
        MatDatepickerModule,
    ],
    selector: 'contezza-share-settings-form-dialog',
    templateUrl: 'settings-form.dialog.component.html',
    styleUrls: ['settings-form.dialog.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [
        // ideally we provide these in CommonModule, but Alfresco CoreModule injects NativeDateAdapter
        { provide: DateAdapter, useClass: MomentDateAdapter },
        { provide: MAT_DATE_FORMATS, useExisting: DATE_FORMATS },
    ],
})
export class SettingsFormDialogComponent {
    // allow type inference when using DialogLoaderService
    readonly response!: ShareSettings;

    readonly TOMORROW = moment().add(1, 'd');

    private readonly dialogRef = inject<MatDialogRef<SettingsFormDialogComponent, ShareSettings>>(MatDialogRef);
    private readonly dateAdapter = inject<DateAdapter<Moment>>(DateAdapter);
    private readonly userPreferencesService = inject(UserPreferencesService);
    private readonly translate = inject(TRANSLATE);
    private readonly extensions = inject(ExtensionService);
    private readonly data = inject<{ nodes: Node[] }>(MAT_DIALOG_DATA);

    private readonly nodes = signal<Node[]>(this.data.nodes);

    readonly linkTypes: LinkType[] = this.extensions.allowedLinkTypes;

    readonly title = computed<DialogTitle>(() => {
        const nodes = this.nodes();
        const singular = nodes.length === 1;
        return {
            label: singular
                ? this.translate('CONTENT_SERVICES.SHARE.DIALOGS.SHARE.TITLE.SINGLE', { name: nodes[0].name })
                : this.translate('CONTENT_SERVICES.SHARE.DIALOGS.SHARE.TITLE.MULTIPLE', { number: nodes.length }),
            tooltip: [singular ? this.translate('CONTENT_SERVICES.SHARE.DIALOGS.SHARE.INFO.SINGLE') : this.translate('CONTENT_SERVICES.SHARE.DIALOGS.SHARE.INFO.MULTIPLE')]
                .concat(this.linkTypes.map(linkType => this.translate(linkType.description + '.' + (singular ? 'SINGLE' : 'MULTIPLE'), { label: this.translate(linkType.label) })))
                .join('\n\n'),
        };
    });

    readonly form = new FormGroup({
        linkType: new FormControl<LinkType>(this.linkTypes.find(({ selected }) => selected) || null, [Validators.required]),
        hasEndDate: new FormControl({ value: false, disabled: true }),
        endDate: new FormControl({ value: moment().add(3, 'days'), disabled: true }, [Validators.required]),
    });

    readonly channels = signal<Channel[]>([]);

    constructor() {
        this.userPreferencesService
            .select(UserPreferenceValues.Locale)
            .pipe(takeUntilDestroyed())
            .subscribe(locale => {
                this.dateAdapter.setLocale(locale);
            });

        const { linkType, hasEndDate, endDate } = this.form.controls;

        linkType.valueChanges.pipe(startWith(linkType.value), filter(Boolean), takeUntilDestroyed()).subscribe(value => {
            this.channels.set(this.extensions.getChannelsByLinkType(value));
            if (value.endDateType === EndDateType.OPTIONAL) {
                hasEndDate.enable();
            } else {
                hasEndDate.disable();
            }
            hasEndDate.setValue(value.endDateType === EndDateType.REQUIRED || (value.endDateType === EndDateType.OPTIONAL && !!endDate.value));
        });

        hasEndDate.valueChanges.pipe(takeUntilDestroyed()).subscribe(value => {
            if (value) {
                endDate.enable();
            } else {
                endDate.disable();
            }
        });
    }

    onSubmit(channel: Channel) {
        this.dialogRef.close({
            linkType: this.form.value.linkType,
            endDate: this.form.value.endDate,
            channel,
        });
    }
}
