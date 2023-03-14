import { AbstractControl } from '@angular/forms';

import { combineLatest, Observable } from 'rxjs';
import { debounceTime, filter, map, startWith, takeUntil } from 'rxjs/operators';

import { ContezzaDynamicForm } from './dynamic-form.class';
import { ContezzaDynamicFormField } from '../interfaces/dynamic-form-field.interface';
import { ContezzaDynamicSearchField } from '../interfaces/dynamic-search-field.interface';

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
        const reducer = (acc, { field, form }: { field: ContezzaDynamicFormField; form: AbstractControl }): Observable<string>[] => {
            const matchingControl = form.get(field.id);
            if (matchingControl && ContezzaDynamicSearchForm.isSearchField(field)) {
                acc.push(
                    field.query(
                        combineLatest([matchingControl.valueChanges, matchingControl.statusChanges]).pipe(
                            debounceTime(0),
                            map(([value, status]) => (status === 'VALID' ? value : undefined)),
                            startWith(undefined)
                        )
                    )
                );
            }
            return field.subfields?.map((subfield) => ({ field: subfield, form: matchingControl || form })).reduce(reducer, acc) || acc;
        };
        const queries: Observable<string>[] = [{ field: this.rootField, form: this.form }].reduce(reducer, []);
        return combineLatest(queries).pipe(
            // let queries wait for each other
            debounceTime(0),
            filter(() => this.form.valid),
            map((combinedQueries) =>
                combinedQueries
                    .filter((value) => !!value)
                    .map((query) => (query.includes('OR') ? `(${query})` : query))
                    .join(' AND ')
            )
        );
    }
}
