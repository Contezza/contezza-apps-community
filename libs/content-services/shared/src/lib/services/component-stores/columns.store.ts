import { Injectable, Optional } from '@angular/core';

import { ComponentStore } from '@ngrx/component-store';

import { combineLatest, Observable, of } from 'rxjs';
import { map, tap, withLatestFrom } from 'rxjs/operators';

import { mergeArrays } from '@alfresco/adf-extensions';

import { ResponsiveService, ScreenSize } from '@contezza/core/responsive';
import { AdfUtils, ContezzaArrayUtils } from '@contezza/core/utils';

import { Column } from '../../models';
import { ContentServicesExtensionService } from '../extension.service';

interface ColumnsState {
    columns: Column[];
}

@Injectable()
export class ColumnsStore extends ComponentStore<ColumnsState> {
    private readonly screenSize$: Observable<ScreenSize> = this.responsive?.screenSize$ || of(ScreenSize.DESKTOP);

    // selectors
    private readonly _columns$ = this.select((state) => state.columns);
    readonly columns$: Observable<(Column & { hidden: boolean })[]> = combineLatest([this._columns$, this.screenSize$]).pipe(
        map(([columns, screenSize]) =>
            columns.map(
                // convert 'hidden' into a boolean
                (column) => ({ ...column, ...(typeof column.hidden !== 'boolean' ? { hidden: !!column.hidden?.includes(screenSize) } : {}) } as Column & { hidden: boolean })
            )
        )
    );
    readonly preset$ = this.select(this._columns$, (columns) => columns.map(({ id, order, hidden, width }) => ({ id, order, hidden, width })));

    // effects
    readonly update = this.effect((columns$: Observable<Partial<Column> | Partial<Column>[]>) =>
        columns$.pipe(
            map((columns) => ContezzaArrayUtils.asArray(columns)),
            withLatestFrom(this._columns$),
            withLatestFrom(this.screenSize$),
            map(([[newColumns, oldColumns], screenSize]) => {
                const filteredNewColumns: Partial<Column>[] = [];
                // manage the merging of property 'hidden'
                newColumns.forEach((newColumn) => {
                    const matchingOldColumn = oldColumns.find(({ id }) => id === newColumn.id);
                    if (matchingOldColumn) {
                        // if 'hidden' is being changed
                        if ('hidden' in newColumn) {
                            const newHidden = newColumn.hidden;
                            if (Array.isArray(newHidden)) {
                                // if it is an array, simply use it as new value
                                matchingOldColumn.hidden = newHidden;
                            } else {
                                // otherwise, turn the old value into a set and build the new value based on that
                                const oldHidden = new Set(
                                    Array.isArray(matchingOldColumn.hidden) ? matchingOldColumn.hidden : matchingOldColumn.hidden ? Object.values(ScreenSize) : []
                                );
                                oldHidden[newHidden ? 'add' : 'delete'](screenSize);
                                matchingOldColumn.hidden = Array.from(oldHidden);
                            }
                            delete newColumn.hidden;
                        }
                        filteredNewColumns.push(newColumn);
                    }
                });
                return mergeArrays(oldColumns, filteredNewColumns).sort((a: Column, b: Column) => {
                    if (a.editable === false || b.editable === false) {
                        return 0;
                    }
                    const left = a.order === undefined ? Number.MAX_SAFE_INTEGER : a.order;
                    const right = b.order === undefined ? Number.MAX_SAFE_INTEGER : b.order;
                    return left - right;
                });
            }),
            tap((columns: Column[]) => this.patchState({ columns }))
        )
    );

    constructor(private readonly extensions: ContentServicesExtensionService, @Optional() private readonly responsive: ResponsiveService) {
        super();
    }

    set id(columnsId: string) {
        const columns = this.extensions.getPropertyDisplayListById<Column>(columnsId);
        if (columns) {
            this.setState({ columns: AdfUtils.filterAndSortFeature(columns) });
        }
    }
}
