import { Injectable } from '@angular/core';

import { ReplaySubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ActionPayload<T = any> extends ReplaySubject<T> {
    constructor() {
        super(1);
    }
}
