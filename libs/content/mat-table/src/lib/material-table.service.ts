import { Injectable } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class ContezzaMaterialTableService {
    private toggleExpandedPanelSource = new BehaviorSubject<any>(null);
    onTogglePanel$ = this.toggleExpandedPanelSource.asObservable();

    togglePanel(element: any) {
        this.toggleExpandedPanelSource.next(element);
    }
}
