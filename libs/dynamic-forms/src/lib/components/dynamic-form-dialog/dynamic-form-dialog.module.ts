import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

import { DialogTitleComponent } from '@contezza/core/dialogs';

import { ContezzaDynamicFormModule } from '../dynamic-form';
import { DynamicFormDialogComponent } from './dynamic-form-dialog.component';

@NgModule({
    declarations: [DynamicFormDialogComponent],
    imports: [CommonModule, ContezzaDynamicFormModule, MatButtonModule, MatDialogModule, TranslateModule, DialogTitleComponent],
})
export class DynamicFormDialogModule {
    static getComponent(): typeof DynamicFormDialogComponent {
        return DynamicFormDialogComponent;
    }
}
