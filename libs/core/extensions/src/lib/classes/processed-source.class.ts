import { combineLatest, Observable, of, OperatorFunction, Subject, Subscriber, TeardownLogic } from 'rxjs';
import { concatMap, debounceTime, filter, map, tap } from 'rxjs/operators';

export class ContezzaLoadingEvent {
    static readonly PROPERTY_LOADING: string = 'loading';
    constructor(public loading: boolean) {}
}

export type ContezzaLoadingObservable<T> = Observable<{ value: T } & ContezzaLoadingEvent>;

export class ContezzaProcessedSource<BaseType = any, ObservableType extends ContezzaLoadingEvent | BaseType = ContezzaLoadingEvent | BaseType> extends Observable<BaseType> {
    constructor(public readonly source: Observable<ObservableType>) {
        super();
    }

    filterLoadingValues(valueLoadingSource?: Subject<boolean>): Observable<BaseType> {
        return this.source.pipe(
            tap(
                (value) =>
                    valueLoadingSource &&
                    value &&
                    typeof value === 'object' &&
                    ContezzaLoadingEvent.PROPERTY_LOADING in value &&
                    valueLoadingSource.next(value[ContezzaLoadingEvent.PROPERTY_LOADING])
            ),
            filter((value) => !(value && typeof value === 'object' && ContezzaLoadingEvent.PROPERTY_LOADING in value)),
            map((value) => value as unknown as BaseType)
        );
    }

    smartPipe(...operations: OperatorFunction<any, any>[]): ContezzaProcessedSource {
        if (operations?.length) {
            return new ContezzaProcessedSource(
                operations.reduce(
                    (acc, operation) =>
                        acc.pipe(
                            concatMap((value) => {
                                if (value && typeof value === 'object' && ContezzaLoadingEvent.PROPERTY_LOADING in value) {
                                    return of(value as ContezzaLoadingEvent);
                                } else {
                                    return of(value as unknown as BaseType).pipe(operation);
                                }
                            })
                        ),
                    this.source
                )
            );
        } else {
            return this;
        }
    }

    pipe(...operations: OperatorFunction<any, any>[]): ContezzaProcessedSource {
        if (operations?.length) {
            return new ContezzaProcessedSource(operations.reduce((acc, operation) => acc.pipe(operation), this.filterLoadingValues()));
        } else {
            return this;
        }
    }

    _subscribe(subscriber: Subscriber<BaseType>): TeardownLogic {
        return this.source
            ?.pipe(
                filter((value) => !(value && typeof value === 'object' && ContezzaLoadingEvent.PROPERTY_LOADING in value)),
                map((value) => value as unknown as BaseType)
            )
            .subscribe(subscriber);
    }

    /**
     * Returns an observable emitting a wrapper of this object's value and loading state.
     */
    asLoadingObservable(): ContezzaLoadingObservable<BaseType> {
        const loading$ = new Subject<boolean>();
        return combineLatest([loading$, this.filterLoadingValues(loading$)]).pipe(
            debounceTime(0),
            map(([loading, value]) => ({ value, ...new ContezzaLoadingEvent(loading) }))
        );
    }
}
