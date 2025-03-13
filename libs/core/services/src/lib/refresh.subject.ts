import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

/**
 * Defines a subject shared in the whole app which can be used to trigger a refresh action.
 */
@Injectable({ providedIn: 'root' })
export class RefreshSubject extends Subject<void> {}
