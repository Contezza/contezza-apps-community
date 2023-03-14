import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';

import { TranslateModule } from '@ngx-translate/core';

import { ContezzaLetModule } from '@contezza/core/directives';

import { MultiDynamicFormModule } from '../multi-dynamic-form';

import { MultiDynamicFormShellComponent } from './multi-dynamic-form-shell.component';
import { SelectorModule } from './components/selector/selector.module';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatDialogModule, TranslateModule, ContezzaLetModule, MultiDynamicFormModule, SelectorModule],
    declarations: [MultiDynamicFormShellComponent],
    exports: [MultiDynamicFormShellComponent],
})
export class MultiDynamicFormShellModule {}
