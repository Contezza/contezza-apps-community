import { EventEmitter } from '@angular/core';

import { combineLatest, Observable } from 'rxjs';
import { map, startWith } from 'rxjs/operators';

export class ContezzaRepeatingObservable<T> extends Observable<T> {
    private readonly repeatEventEmitter: EventEmitter<void> = new EventEmitter<void>();

    constructor(source: Observable<T>) {
        super();
        this.source = combineLatest([source, this.repeatEventEmitter.pipe(startWith(undefined))]).pipe(map(([value]) => value));
    }

    repeat() {
        this.repeatEventEmitter.next();
    }
}
