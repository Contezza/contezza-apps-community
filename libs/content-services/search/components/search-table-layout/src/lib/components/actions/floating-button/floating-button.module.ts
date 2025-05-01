import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { IconModule } from '@alfresco/adf-core';
import { ExtensionsModule } from '@alfresco/adf-extensions';

import { FloatingButtonComponent } from './floating-button.component';

@NgModule({
    imports: [CommonModule, MatButtonModule, MatDividerModule, MatMenuModule, TranslateModule, IconModule, ExtensionsModule],
    declarations: [FloatingButtonComponent],
    exports: [FloatingButtonComponent],
})
export class FloatingButtonModule {}
