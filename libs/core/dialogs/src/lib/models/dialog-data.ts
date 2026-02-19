import { ComponentType } from '@angular/cdk/overlay';
import { MatDialogRef } from '@angular/material/dialog';

import type { DialogComponent } from '../components';

export interface DialogTitle {
    label: string;
    params?: any;
    tooltip?: string;
}

export interface ComponentDialogContent<TComponent> {
    component: ComponentType<TComponent> | (() => Promise<ComponentType<TComponent>>);
    inputs?: any;
}

export type DialogContent = ComponentDialogContent<unknown>;

export interface DialogAction {
    id: string;
    title: string;
    matType?: 'mat-button' | 'mat-raised-button';
    color?: string;
    // disabled$?: Observable<boolean>;
    execute?: (contentComponent: unknown, dialogRef: MatDialogRef<DialogComponent>) => void;
    getResponse?: (contentComponent: unknown) => unknown;
}

export interface DialogData {
    title?: string | DialogTitle;
    content?: DialogContent;
    actions?: DialogAction[];
}

/**
 * @deprecated refactor and use {@link DialogData}
 */
export interface DialogDataOld {
    title: string | DialogTitle;
    buttons: DialogButtons;
}

export interface DialogButtons {
    cancel: string;
    submit: string;
}
