import { Component } from '@angular/core';

import { Observable } from 'rxjs';

import { AppService } from '@alfresco/aca-shared';

@Component({
    selector: 'app-root',
    template: `
        <ng-container *ngIf="pageHeading$ | async | translate as pageHeading">
            <h1 class="app-sr-only" title="{{ pageHeading }}">{{ pageHeading }}</h1>
        </ng-container>
        <router-outlet></router-outlet>
    `,
    styles: [
        `
            :host {
                display: flex;
                flex: 1;
            }
            :host .app-sr-only {
                position: absolute;
                width: 1px;
                height: 1px;
                padding: 0;
                margin: -1px;
                overflow: hidden;
                clip: rect(0, 0, 0, 0);
                border: 0;
            }
        `,
    ],
})
export class AppComponent {
    pageHeading$: Observable<string> = this.appService.pageHeading$;

    constructor(private appService: AppService) {
        this.appService.init();
    }
}
