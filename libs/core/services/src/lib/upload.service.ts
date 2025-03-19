import { Injectable } from '@angular/core';

import { filter, map, Observable, take } from 'rxjs';

import { Node } from '@alfresco/js-api';
import { FileModel, UploadService as AdfUploadService } from '@alfresco/adf-content-services';

@Injectable({ providedIn: 'root' })
export class UploadService {
    /**
     * Clone of the injected `AdfUploadService`. Upload dialog subscribes to observables in the original `AdfUploadService`, therefore this can be used to upload without showing the dialog.
     *
     * @private
     */
    private _uploadWithoutDialog?: AdfUploadService;
    private get uploadWithoutDialog(): AdfUploadService {
        if (!this._uploadWithoutDialog) {
            const untypedUpload: any = this.upload;
            this._uploadWithoutDialog = new AdfUploadService(untypedUpload.apiService, untypedUpload.appConfigService, untypedUpload.discoveryApiService);
        }
        return this._uploadWithoutDialog;
    }

    constructor(private readonly upload: AdfUploadService) {}

    uploadFiles(files: FileModel[], options?: { showInUploadDialog?: boolean }): Observable<Node[]> {
        const showInUploadDialog = options?.showInUploadDialog ?? true;
        const service: AdfUploadService = showInUploadDialog ? this.upload : this.uploadWithoutDialog;
        // upload files
        service.addToQueue(...files);
        service.uploadFilesInTheQueue();
        // wait until all files are uploaded
        return UploadService.onUploadComplete$(service.fileUploadComplete, files);
    }

    /**
     * Returns an observable which emits when all given files are uploaded.
     *
     * @param files
     */
    onUploadComplete$(files: FileModel[]): Observable<Node[]> {
        return UploadService.onUploadComplete$(this.upload.fileUploadComplete, files);
    }

    /**
     * Prepares an observable that emits the uploaded nodes only after all files are uploaded.
     *
     * @param $
     * @param files List of files expected to be uploaded
     */
    private static onUploadComplete$($: Observable<unknown>, files: FileModel[]): Observable<Node[]> {
        return $.pipe(
            // alfresco upload service fills in 'data' with the created node as soon as the file is uploaded
            map(() => files.map((file) => file.data?.entry)),
            // if these are all defined then all files are uploaded
            filter((nodes) => nodes.every(Boolean)),
            take(1)
        );
    }
}
