import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { InputTypePipe } from './input-type.pipe';
import { IsRequiredPipe } from './is-required.pipe';

@NgModule({
    imports: [CommonModule],
    declarations: [InputTypePipe, IsRequiredPipe],
    exports: [InputTypePipe, IsRequiredPipe],
})
export class ContezzaDynamicFormsPipesModule {}
