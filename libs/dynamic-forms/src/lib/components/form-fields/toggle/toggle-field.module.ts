import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';
import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { ToggleFieldComponent } from './toggle-field.component';

@NgModule({
    imports: [CommonModule, ContezzaLetModule, MatSlideToggleModule, ReactiveFormsModule, TranslateModule],
    declarations: [ToggleFieldComponent],
    exports: [ToggleFieldComponent],
})
export class ContezzaToggleFieldModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setFieldComponents({
            toggle: ToggleFieldComponent,
        });
    }
}
