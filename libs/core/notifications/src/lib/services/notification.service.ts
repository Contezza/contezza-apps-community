import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NotificationService {
    private readonly closeSource = new Subject<void>();
    readonly close$ = this.closeSource.asObservable();

    closeDialog() {
        this.closeSource.next();
    }
}
