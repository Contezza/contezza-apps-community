import { Component } from '@angular/core';

import { TranslatePipe } from '@ngx-translate/core';

import { AppConfigPipe, LoginComponent as AdfLoginComponent } from '@alfresco/adf-core';

@Component({
    standalone: true,
    imports: [TranslatePipe, AppConfigPipe, AdfLoginComponent],
    templateUrl: './login.component.html',
})
export class LoginComponent {}
