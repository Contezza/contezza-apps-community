import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ReactiveFormsModule } from '@angular/forms';

import { TranslateModule } from '@ngx-translate/core';

import { JsConsoleScriptSaveDialogComponent } from './script-save-dialog.component';

@NgModule({
    declarations: [JsConsoleScriptSaveDialogComponent],
    imports: [CommonModule, MatDialogModule, TranslateModule, MatButtonModule, MatIconModule, MatTabsModule, MatFormFieldModule, MatInputModule, ReactiveFormsModule],
})
export class JsConsoleScriptSaveDialogModule {
    static getComponent(): typeof JsConsoleScriptSaveDialogComponent {
        return JsConsoleScriptSaveDialogComponent;
    }
}
