import { Injectable } from '@angular/core';

import { Store } from '@ngrx/store';

import { BehaviorSubject, Subject } from 'rxjs';

import { SpinnerOverlayService } from './spinner-overlay.service';

@Injectable({
    providedIn: 'root',
})
export class ContezzaCommonService {
    private readonly errorKey = 'ERROR.';

    private msTokenSource = new BehaviorSubject<any>(null);
    msToken$ = this.msTokenSource.asObservable();

    private refreshSource = new Subject<any>();
    onRefresh$ = this.refreshSource.asObservable();

    private dropdownsSource = new Subject<any>();
    dropdownsReady$ = this.dropdownsSource.asObservable();

    private updateBrowseFilesSelection = new Subject<any>();
    onUpdateBrowseSelection$ = this.updateBrowseFilesSelection.asObservable();

    reload = new Subject<any>();
    reset = new Subject<any>();

    constructor(private readonly store: Store<unknown>, private readonly spinner: SpinnerOverlayService) {}

    refresh(args: any = true): void {
        this.refreshSource.next(args);
    }

    setMsToken(token) {
        this.msTokenSource.next(token);
    }

    dropdownsReady(): void {
        this.dropdownsSource.next(true);
    }

    updateBrowseSelection(): void {
        this.updateBrowseFilesSelection.next(true);
    }

    handleError(error: any, silent?: boolean): void {
        this.spinner.hide();
        if (!silent) {
            const parsedError = JSON.parse(JSON.stringify(error));
            const statusCode = parsedError?.status;

            if (statusCode) {
                if (statusCode === 401) {
                    this.store.dispatch({ type: 'CLOSE_MODAL_DIALOGS' });
                    this.store.dispatch({ type: 'NAVIGATE_ROUTE', payload: ['login'] });
                } else if (statusCode === 500 || statusCode === 404) {
                    const message = parsedError?.response?.body?.message;
                    this.store.dispatch({ type: 'SNACKBAR_ERROR', payload: message ? this.constructErrorMessage(message) : 'APP.MESSAGES.ERRORS.GENERIC', duration: 4000 });
                } else {
                    this.store.dispatch({ type: 'SNACKBAR_ERROR', payload: 'APP.MESSAGES.ERRORS.GENERIC' });
                }
            }
        }
    }

    constructErrorMessage(message: string): string {
        return message.includes(this.errorKey) ? `${this.errorKey}${message.split(this.errorKey)[1]}` : message;
    }
}
