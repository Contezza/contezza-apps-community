import { Injectable } from '@angular/core';

import { forkJoin, Observable, of } from 'rxjs';
import { catchError, map, switchMap, take } from 'rxjs/operators';

import { ResultSetPaging } from '@alfresco/js-api';
import { AlfrescoApiService, AuthenticationService, ContentService } from '@alfresco/adf-core';
import { ExtensionConfig, mergeObjects } from '@alfresco/adf-extensions';
import { SearchService } from '@alfresco/adf-content-services';

import { ContezzaObservables } from '@contezza/core/utils';

@Injectable({ providedIn: 'root' })
export class ContezzaDynamicExtensionService {
    constructor(
        private readonly apiService: AlfrescoApiService,
        private readonly auth: AuthenticationService,
        private readonly contentService: ContentService,
        private readonly search: SearchService
    ) {}

    load(queries: string[]): Observable<ExtensionConfig> {
        try {
            return this.apiService.alfrescoApiInitialized.pipe(
                take(1),
                switchMap(() =>
                    this.auth.isLoggedIn()
                        ? (queries.length
                              ? forkJoin(
                                    queries.map((query) =>
                                        this.search
                                            .searchByQueryBody({
                                                query: {
                                                    query,
                                                    language: 'afts',
                                                },
                                            })
                                            .pipe(catchError(() => of(undefined)))
                                    )
                                )
                              : of([])
                          ).pipe(
                              map((results: ResultSetPaging[]) =>
                                  results
                                      .filter((value) => !!value)
                                      .map((result) => result.list.entries.map((entry) => entry.entry.id))
                                      .flat()
                              ),
                              switchMap((ids) =>
                                  ids.length
                                      ? forkJoin(
                                            ids.map((id) =>
                                                this.getNodeContent(id).pipe(
                                                    map((json) => {
                                                        try {
                                                            return JSON.parse(json);
                                                        } catch (e) {
                                                            return {};
                                                        }
                                                    })
                                                )
                                            )
                                        )
                                      : of([])
                              ),
                              map((configs) => mergeObjects(...configs))
                          )
                        : of(undefined)
                )
            );
        } catch (e) {
            return of(undefined);
        }
    }

    private getNodeContent(nodeId: string): Observable<string> {
        return this.contentService.getNodeContent(nodeId).pipe(
            switchMap((content) =>
                ContezzaObservables.fromEmitter<string>((emitter) => {
                    const reader = new FileReader();
                    reader.onload = () => emitter.next(typeof reader.result === 'string' ? reader.result : JSON.stringify(reader.result));
                    reader.readAsText(content);
                })
            ),
            take(1)
        );
    }
}
