import { NgModule } from '@angular/core';
import { ContezzaLetDirective } from './let.directive';

@NgModule({
    imports: [ContezzaLetDirective],
    exports: [ContezzaLetDirective],
})
export class ContezzaLetModule {}
