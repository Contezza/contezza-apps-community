import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TranslateModule } from '@ngx-translate/core';

import { CoreModule } from '@alfresco/adf-core';

import { ContezzaDynamicFormExtensionService } from '@contezza/dynamic-forms/shared';

import { PersonOptionComponent } from './person-option.component';
import { AvatarImagePipe } from './avatar-image.pipe';

@NgModule({
    imports: [CommonModule, CoreModule, TranslateModule],
    declarations: [AvatarImagePipe, PersonOptionComponent],
    exports: [PersonOptionComponent],
})
export class ContezzaPersonOptionModule {
    constructor(extensions: ContezzaDynamicFormExtensionService) {
        extensions.setOptionComponents({ person: PersonOptionComponent });
    }
}
