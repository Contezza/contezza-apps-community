import { inject, Injectable } from '@angular/core';
import { MatDialogConfig } from '@angular/material/dialog';

import { from, Observable, switchMap } from 'rxjs';

import { DialogData } from '../models';
import { DialogOutletService } from './dialog-outlet.service';

type MatDialogConfigWithRequiredData<D> = MatDialogConfig<D> & { data: D };

@Injectable({ providedIn: 'root' })
export class DialogService {
    // constructor
    private readonly dialog = inject<DialogOutletService<unknown, unknown, unknown>>(DialogOutletService);

    open(data: MatDialogConfigWithRequiredData<DialogData>): Observable<unknown> {
        return from(import('../components').then(_ => _.DialogComponent)).pipe(switchMap(dialogComponent => this.dialog.open({ getComponent: () => dialogComponent }, data)));
    }

    close(...ids: string[]) {
        this.dialog.close(...ids);
    }
}
