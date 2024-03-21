import { Subject } from 'rxjs';

type ObserverOrCallback<T> = Subject<T> | ((_: T) => void);

/**
 * `Subject` which emits only one value. The value is emitted using method `next`. Any new call of this method is denied.
 * Method `subscribe` allows to listen to this value. Subscribing after the `next` call immediately returns the value.
 * Subscribing before the `next` call puts the subscriber in a waiting list. All subscribers in the waiting list will receive the value as soon as this is emitted.
 *
 * Use case: registry services whose values are api responses. In this case it may happen that the call for the same value is executed multiple times before the first response is received.
 */
export class OneTimeSubject<T> {
    private static next = <_T>(observer: ObserverOrCallback<_T>, value: _T) => {
        if ('next' in observer) {
            observer.next(value);
            observer.complete();
        } else {
            observer(value);
        }
    };

    private value?: T;
    private readonly observers: ObserverOrCallback<T>[] = [];

    next(value: T) {
        if (this.value) {
            throw new Error('Value already defined');
        }
        // set the new value
        this.value = value;
        // send the new value to all observers
        // clean observer list
        while (this.observers.length) {
            OneTimeSubject.next(this.observers.pop()!, value);
        }
    }

    subscribe(...observers: ObserverOrCallback<T>[]) {
        if (this.value) {
            const value = this.value;
            // value already exists, emit immediately
            observers.forEach((observer) => OneTimeSubject.next(observer, value));
        } else {
            // add as observer to emit the value as soon as it is ready
            this.observers.push(...observers);
        }
    }
}
