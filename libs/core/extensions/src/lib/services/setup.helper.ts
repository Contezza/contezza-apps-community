import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import { catchError, filter, forkJoin, map, Observable, of, switchMap, tap } from 'rxjs';

import { FileModel, SearchService } from '@alfresco/adf-content-services';
import { Node } from '@alfresco/js-api';

import { UploadService } from '@contezza/core/services';

/**
 * Helper class defined to improve code reusability in Setup services.
 */
@Injectable({ providedIn: 'root' })
export class SetupHelper {
    // constructor
    private readonly http = inject(HttpClient);
    private readonly search = inject(SearchService);
    private readonly upload = inject(UploadService);

    /**
     * Reads the file with the given names from the given source (usually app assets) and copies them in the given destination (in Alfresco).
     *
     * @param source The source of the setup files, usually from app assets, e.g. 'assets/app/mgmt/setup'.
     * @param destination The Alfresco path where the new files must be placed, e.g. 'app:company_home/app:dictionary/cm:Contezza/cm:AppConfig'.
     * @param fileNames The names of the files as they appear in the source. The same name is used to save the files in Alfresco.
     * @returns Objects representing the created nodes.
     */
    setupFiles(source: string, destination: string, ...fileNames: string[]) {
        return forkJoin(
            fileNames.map(name =>
                forkJoin({
                    name: of(name),
                    // try to get the config in case it already exists
                    currentNode: this.searchNodeByPath(`${destination}/cm:${name}`),
                    // new config from assets
                    newContent: this.makeConfigContent(source, name),
                }),
            ),
        ).pipe(switchMap(data => this.uploadFiles(data, destination)));
    }

    private uploadFiles(data: { name: string; currentNode?: Node; newContent: object }[], destination: string) {
        // if any config file does not exist yet, then search Data Dictionary folder because its id will be used as parentId
        const parentIdAndRelativePathIfNecessary$: Observable<{ parentId: string; relativePath: string } | undefined> = data.some(config => !config.currentNode)
            ? this.getParentIdAndRelativePath$(destination)
            : of(undefined);
        return parentIdAndRelativePathIfNecessary$.pipe(
            switchMap(pathData => {
                // prepare file models
                const fileModels = data.map(({ name, currentNode, newContent }) => {
                    const file: File = new File([JSON.stringify(newContent)], name);
                    return currentNode
                        ? // config already exists => replace
                          new FileModel(
                              file,
                              {
                                  majorVersion: false,
                                  newVersion: true,
                              },
                              currentNode.id,
                          )
                        : // config does not exist => prepare path (relative to Data Dictionary)
                          new FileModel(file, {
                              majorVersion: false,
                              newVersion: false,
                              path: pathData!.relativePath,
                              parentId: pathData!.parentId,
                          });
                });
                // upload all
                return this.upload.uploadFiles(fileModels, { showInUploadDialog: false });
            }),
        );
    }

    private getParentIdAndRelativePath$(path: string): Observable<{ parentId: string; relativePath: string }> {
        const splitPath = path.split('/');
        const firstNonAppFolderIndex = splitPath.findIndex(item => !item.startsWith('app:'));
        const parentPath = splitPath.slice(0, firstNonAppFolderIndex).join('/');
        return this.searchNodeByPath(parentPath).pipe(
            tap(node => {
                if (!node) {
                    throw new Error('Parent folder not found. Expected path: ' + parentPath);
                }
            }),
            filter(Boolean),
            map(_ => ({
                parentId: _.id,
                relativePath: splitPath
                    .slice(firstNonAppFolderIndex)
                    .map(name => name.split(':').at(-1))
                    .join('/'),
            })),
        );
    }

    private searchNodeByPath(path: string): Observable<Node | undefined> {
        return this.search.searchByQueryBody({ query: { query: `PATH:"${path}"` } }).pipe(map(response => response.list?.entries?.[0]?.entry as Node | undefined));
    }

    private makeConfigContent(source: string, name: string): Observable<object> {
        const path = source + '/' + name;
        return this.http.get(path).pipe(
            catchError(() => {
                console.error('Setup file not found. Expected path: ' + path);
                return of(undefined);
            }),
        );
    }
}
