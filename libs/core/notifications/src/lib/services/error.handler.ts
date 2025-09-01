import { ErrorHandler as NgErrorHandler, Injectable, Injector, NgZone } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import { Store } from '@ngrx/store';

import { catchError, of } from 'rxjs';

import { openErrorDetailsDialog } from '../store';

@Injectable({ providedIn: 'root' })
export class ErrorHandler extends NgErrorHandler {
    static readonly PROVIDER = { provide: NgErrorHandler, useExisting: ErrorHandler };

    // Because the ErrorHandler is created before the providers, we’ll have to use the Injector to get them.
    constructor(private readonly injector: Injector) {
        super();
    }

    handleError(e: Error) {
        this.showErrorMessage(e);
        super.handleError(e);
    }

    catchError = catchError((e) => {
        console.error(e);
        this.showErrorMessage(e);
        return of(undefined as any);
    });

    showErrorMessage(e: Error) {
        const payload = ErrorHandler.formatError(e);
        if (payload) {
            this.injector.get(NgZone).run(() => this.injector.get(Store).dispatch(openErrorDetailsDialog({ payload })));
        }
    }

    static formatError(e: Error): { message: string; details: any } | undefined {
        if (e instanceof HttpErrorResponse) {
            if (e.status !== 401) {
                return { message: 'APP.MESSAGES.ERROR', details: e };
            } else {
                return undefined;
            }
        }
        let details;
        try {
            details = JSON.parse(e.message);
        } catch (_) {}
        if (details?.error) {
            details = details.error;
        }
        if (details) {
            if (details.status?.code !== 401 && details.statusCode !== 401) {
                return { message: 'APP.MESSAGES.ERROR', details };
            }
        }
        return undefined;
    }
}
