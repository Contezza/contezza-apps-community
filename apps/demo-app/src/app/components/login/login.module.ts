import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@alfresco/adf-core';
import { LoginComponent } from './login.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
    imports: [CommonModule, CoreModule.forChild(), TranslateModule.forChild()],
    exports: [LoginComponent],
    declarations: [LoginComponent],
})
export class AppLoginModule {}
