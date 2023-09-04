import { EventEmitter } from '@angular/core';

import { forkJoin, from, Observable, ObservedValueOf, of, Subject, Subscriber, TeardownLogic } from 'rxjs';
import { filter, finalize, map, switchMap, tap } from 'rxjs/operators';

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

    /**
     * Variant of rxjs `from` which only triggers the underlying asynchronous operation by subscription.
     *
     * @param generator A function returning an asynchronous operation.
     */
    static from<T>(generator: () => Promise<T>): Observable<T> {
        return of(null).pipe(switchMap(() => from(generator())));
    }

    static forkJoin<T>(observables: Observable<T>[]): Observable<T[]>;
    static forkJoin<T>(sourcesObject: T): Observable<{ [K in keyof T]: ObservedValueOf<T[K]> }>;
    /**
     * Extends rxjs forkJoin by allowing an empty array or an empty object as input.
     *
     * @param source
     */
    static forkJoin(source: Observable<any>[]): Observable<any> {
        return Array.isArray(source) ? (source?.length ? forkJoin(source) : of([])) : Object.keys(source).length ? forkJoin(source) : of({});
    }

    /**
     * Cross filters two observables, i.e. prevents the one from emitting based on the other's value.
     * Returns a tuple containing the filtered observables.
     * This is useful to prevent an infinite loop in situations where each observable causes a new emission of the other, e.g. synchronizing two form values.
     *
     * @param source1 First observable to be cross filtered.
     * @param source2 Second observable to be cross filtered.
     * @param emitIf Boolean function allowing to compare the to-be-emitted value of one source with the last-emitted value of the other. The new value is only emitted if this function evaluates to `true`. Defaults to `!==`.
     */
    static crossFilter<T>(
        source1: Observable<T>,
        source2: Observable<T>,
        emitIf: (value1: T, value2: T) => boolean = (value1, value2) => value1 !== value2
    ): [Observable<T>, Observable<T>] {
        let lastSource1Value: T;
        let lastSource2Value: T;

        return [
            source1.pipe(
                filter((value) => emitIf(value, lastSource2Value)),
                tap((value) => (lastSource1Value = value))
            ),
            source2.pipe(
                filter((value) => emitIf(lastSource1Value, value)),
                tap((value) => (lastSource2Value = value))
            ),
        ];
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
