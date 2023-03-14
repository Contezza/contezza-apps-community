import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { SanitizeHtmlPipe } from '@contezza/core/pipes';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { MultiautocompleteFieldComponent } from './multiautocomplete-field.component';
import { ContezzaDynamicFormsCommonModule } from '../../../dynamic-forms.common.module';
import { ContezzaDynamicFormOptionModule } from '../../dynamic-form-option';

@NgModule({
    imports: [
        CommonModule,
        ContezzaDynamicFormsCommonModule,
        ContezzaDynamicFormOptionModule,
        ContezzaLetModule,
        MatButtonModule,
        MatIconModule,
        MatInputModule,
        MatProgressSpinnerModule,
        MatSelectModule,
        ReactiveFormsModule,
        TranslateModule,
        SanitizeHtmlPipe,
        MatCheckboxModule,
    ],
    declarations: [MultiautocompleteFieldComponent],
    exports: [MultiautocompleteFieldComponent],
})
export class ContezzaMultiautocompleteFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            multiautocomplete: MultiautocompleteFieldComponent,
        });
    }
}
