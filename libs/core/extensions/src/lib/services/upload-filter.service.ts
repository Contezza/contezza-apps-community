import { Injectable } from '@angular/core';

import { Observable, of } from 'rxjs';
import { concatMap, filter, tap } from 'rxjs/operators';

import { FileModel, FileUploadStatus, UploadService } from '@alfresco/adf-content-services';

export type UploadFilter = (_: Observable<FileModel[]>) => Observable<FileModel[]>;

@Injectable({ providedIn: 'root' })
export class UploadFilterService {
    static readonly FileUploadStatus = {
        Processing: 'processing' as unknown as FileUploadStatus,
    };

    private readonly filters: Record<string, UploadFilter> = {};

    constructor(upload: UploadService) {
        upload.queueChanged
            .pipe(
                // bypass filters if the upload comes from adf-new-version-uploader-dialog because:
                // adf-new-version-uploader-dialog post-upload flow works based on a success emitter passed in the uploadFilesInTheQueue call
                // filters intercept that call and send a new call without success emitter, preventing the post-upload flow from triggering
                // hence: the dialog does not close, locked files are niet unlocked
                filter(() => document.getElementsByTagName('adf-new-version-uploader-dialog').length === 0),
                tap((queue) =>
                    queue.forEach((file) => {
                        if (file.status === FileUploadStatus.Pending) {
                            file.status = UploadFilterService.FileUploadStatus.Processing;
                        }
                    })
                ),
                concatMap((queue) => Object.values(this.filters).reduce((acc, filter) => filter(acc), of(queue))),
                tap((queue) => {
                    queue.forEach((file) => {
                        if (file.status === UploadFilterService.FileUploadStatus.Processing) {
                            file.status = FileUploadStatus.Pending;
                        }
                    });
                    upload.uploadFilesInTheQueue();
                })
            )
            .subscribe();
    }

    addFilters(filters: Record<string, UploadFilter>) {
        Object.assign(this.filters, filters);
    }
}
