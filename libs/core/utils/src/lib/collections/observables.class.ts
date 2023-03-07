import { EventEmitter } from '@angular/core';

import { forkJoin, from, Observable, of, Subject, Subscriber, TeardownLogic } from 'rxjs';
import { finalize, map, switchMap } from 'rxjs/operators';

export class ContezzaObservables {
    /**
     * Concatenates a list of observables and returns the merged observed values.
     * The observables are generated using the given `observableGenerator`, for values 0,1,2,... until the given `whileCondition` evaluates to false.
     * The observed values are merged using the given `valueMerger`.
     *
     * @param whileCondition
     * @param observableGenerator
     * @param valueMerger
     */
    static while<T>(
        whileCondition: (response: T, index: number) => boolean,
        observableGenerator: (index: number) => Observable<T>,
        valueMerger: (response1: T, response2: T) => T = (_, response2) => response2
    ): Observable<T> {
        const recursion = (obs: (i: number) => Observable<T>, i: number) =>
            obs(i).pipe(
                switchMap((response) => (whileCondition(response, i) ? recursion(obs, i + 1) : of(undefined)).pipe(map((newResponse: T) => [response, newResponse]))),
                map(([response, newResponse]) => (newResponse ? valueMerger(response, newResponse) : response))
            );
        return recursion(observableGenerator, 0);
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
