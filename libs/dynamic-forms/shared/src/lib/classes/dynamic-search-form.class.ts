import { AbstractControl } from '@angular/forms';

import { combineLatest, Observable, of } from 'rxjs';
import { debounceTime, filter, map, pluck, startWith, switchMap, takeUntil } from 'rxjs/operators';

import { ContezzaObjectUtils } from '@contezza/core/utils';

import { ContezzaDynamicForm } from './dynamic-form.class';
import { ContezzaDynamicFormField, ContezzaDynamicSearchField } from '../models';

export class ContezzaDynamicSearchForm extends ContezzaDynamicForm {
    private _query: Observable<string>;
    get query(): Observable<string> {
        return combineLatest([this._built, this._query]).pipe(
            filter(([built]) => built),
            map(([, query]) => query),
            // necessary because of the debounceTime in bindQueries()
            // without this an empty query is emitted before the initialValues are loaded
            debounceTime(0),
            takeUntil(this.destroy$)
        );
    }

    static isSearchField(field: ContezzaDynamicFormField): field is ContezzaDynamicFormField & ContezzaDynamicSearchField {
        return 'query' in field;
    }

    protected buildExtras() {
        super.buildExtras();
        this._query = this.bindQueries();
    }

    protected destroyExtras() {
        super.destroyExtras();
        this._query = undefined;
    }

    private bindQueries(): Observable<string> {
        const recursion = ({ field, form }: { field: ContezzaDynamicFormField; form: AbstractControl }): Observable<{ id: string; query: string }> => {
            const matchingControl = field.id && form.get(field.id);
            return (
                matchingControl && !('controls' in matchingControl)
                    ? // base case: form control -> query
                      ContezzaDynamicSearchForm.isSearchField(field)
                        ? field.query(
                              combineLatest([matchingControl.valueChanges, matchingControl.statusChanges]).pipe(
                                  debounceTime(0),
                                  map(([value, status]) => (status === 'VALID' ? value : undefined)),
                                  startWith(undefined)
                              )
                          )
                        : of('')
                    : // induction step: collect queries from subfields
                      combineLatest((field.subfields || []).map((subfield) => recursion({ field: subfield, form: matchingControl || form }))).pipe(
                          // let queries wait for each other
                          debounceTime(0),
                          map((value) => (this.form.valid ? value : [])),
                          // convert {id, query}[] into {id: query}
                          map((queries) =>
                              ContezzaObjectUtils.fromEntries<any>(
                                  queries.filter(({ query }) => !!query).map(({ id, query }) => [id, query.includes(' OR ') ? `(${query})` : query])
                              )
                          ),
                          // combine queries using a wrapper query
                          ContezzaDynamicSearchForm.isSearchField(field)
                              ? // apply wrapper query from configuration if defined
                                switchMap((queries) => field.query(of(queries)))
                              : // apply default wrapper query otherwise
                                map((queries) => Object.values(queries).join(' AND '))
                      )
            ).pipe(
                // wrap query to make field id available
                map((query) => ({ id: field.id, query }))
            );
        };
        return recursion({ field: this.rootField, form: this.form }).pipe(pluck('query'));
    }
}
