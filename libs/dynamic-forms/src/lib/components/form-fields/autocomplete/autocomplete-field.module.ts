import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { SanitizeHtmlPipe } from '@contezza/core/pipes';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { AutocompleteFieldComponent } from './autocomplete-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';
import { ContezzaDynamicFormOptionModule } from '../../dynamic-form-option';
import { HighlightPipe } from './highlight.pipe';

@NgModule({
    imports: [
        CommonModule,
        ContezzaDynamicFormsCommonModule,
        ContezzaDynamicFormOptionModule,
        ContezzaLetModule,
        MatAutocompleteModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule,
        TranslateModule,
        SanitizeHtmlPipe,
    ],
    declarations: [AutocompleteFieldComponent, HighlightPipe],
    exports: [AutocompleteFieldComponent],
})
export class ContezzaAutocompleteFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            autocomplete: AutocompleteFieldComponent,
        });
    }
}
