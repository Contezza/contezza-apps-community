import { EventEmitter } from '@angular/core';

import { forkJoin, from, Observable, of, Subject, Subscriber, TeardownLogic } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

export class ContezzaObservables {
    /**
     * Concatenates a list of observables and returns the merged observed values.
     * The observables are generated using the given `observableGenerator` until the given `whileCondition` evaluates to `false`.
     * The observed values are merged using the given `valueMerger`.
     * Surrogates
     * <pre>
     *     let value = undefined;
     *     let index = 0;
     *     while(value === undefined || whileCondition(value, index)) {
     *          newValue = observableGenerator(value, index);
     *          value = valueMerger(value, newValue);
     *          index++;
     *     }
     *     return value;
     * </pre>
     *
     * @param whileCondition Boolean function of observed value and index. The loop stops if it evaluates to `false`.
     * @param observableGenerator Function of observed value and index which returns the following observable to be concatenated.
     * @param valueMerger Function defining how any two observed values must be merged.
     */
    static while<T>(
        whileCondition: (value: T, index: number) => boolean,
        observableGenerator: (value: T, index: number) => Observable<T>,
        valueMerger: (value1: T, value2: T) => T = (_, value2) => value2
    ): Observable<T> {
        const recursion = (obs: (value: T, index: number) => Observable<T>, value: T = undefined, index: number = 0) =>
            value === undefined || whileCondition(value, index)
                ? obs(value, index).pipe(
                      map((newValue: T) => (value && newValue ? valueMerger(value, newValue) : value || newValue)),
                      switchMap((newValue) => recursion(obs, newValue, index + 1))
                  )
                : of(value);
        return recursion(observableGenerator);
    }

    static from<T>(promise: Promise<T>): Observable<T> {
        return of(null).pipe(switchMap(() => from(promise)));
    }

    /**
     * Extends rxjs forkJoin by allowing an empty array as input
     *
     * @param observables
     */
    static forkJoin(observables: Observable<any>[]): Observable<any[]> {
        return observables?.length ? forkJoin(observables) : of([]);
    }

    static fromCallbackable<T>(callbackable: (_: (_: T) => void) => void): Observable<T> {
        return of(null).pipe(
            switchMap(() => {
                const subject = new Subject<T>();
                callbackable((value) => subject.next(value));
                return subject.asObservable();
            })
        );
    }

    static fromEmitter<T>(emitting: (_: EventEmitter<T>) => void): Observable<T> {
        const emitter = new EventEmitter<T>();
        emitting(emitter);
        return emitter;
    }

    static copyConstructor<T>(source: Observable<T>): (_: Subscriber<T>) => TeardownLogic {
        return (subscriber) => source.pipe(finalize(() => subscriber.complete())).subscribe((value) => subscriber.next(value));
    }
}
