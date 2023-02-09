import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatTableModule } from '@angular/material/table';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatTabsModule } from '@angular/material/tabs';
import { MatListModule } from '@angular/material/list';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
    imports: [
        MatTooltipModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatListModule,
        MatProgressBarModule,
        MatChipsModule,
        MatTableModule,
    ],
    exports: [
        MatTooltipModule,
        MatButtonModule,
        MatProgressSpinnerModule,
        MatTabsModule,
        MatMenuModule,
        MatIconModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatListModule,
        MatProgressBarModule,
        MatChipsModule,
        MatTableModule,
    ],
})
export class JsConsoleMaterialModule {}
