import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ContezzaResizableDirective } from './resizable.directive';
import { ContezzaResizableComponent } from './resizable.component';

@NgModule({
    imports: [CommonModule],
    declarations: [ContezzaResizableComponent, ContezzaResizableDirective],
    exports: [ContezzaResizableComponent, ContezzaResizableDirective],
})
export class ContezzaResizableModule {}
