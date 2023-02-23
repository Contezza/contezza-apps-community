import { Component } from '@angular/core';
import { Observable } from 'rxjs';
import { AppService } from '@alfresco/aca-shared';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss'],
})
export class AppComponent {
    pageHeading$: Observable<string> = this.appService.pageHeading$;

    constructor(private appService: AppService) {
        this.appService.init();
    }
}
