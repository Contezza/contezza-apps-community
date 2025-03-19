import { ComponentRef, Inject, Injectable, InjectionToken, Optional } from '@angular/core';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';

import { Actions, ofType } from '@ngrx/effects';
import { routerNavigatedAction } from '@ngrx/router-store';

import { ContentActionRef } from '@alfresco/adf-extensions';

import { ContextMenuComponent } from '../components/context-menu/context-menu.component';
import { ContextMenuSettings } from '../models';

export const CONTEXT_MENU_SETTINGS = new InjectionToken<Partial<ContextMenuSettings>[]>('context-menu-settings');

/**
 * Provides a method to open an overlay context menu.
 */
@Injectable({ providedIn: 'root' })
export class ContextMenuOverlayService {
    static readonly provideSettings = (useValue: Partial<ContextMenuSettings>) => ({ provide: CONTEXT_MENU_SETTINGS, multi: true, useValue });

    private overlayRef?: OverlayRef;

    private get settings(): Partial<ContextMenuSettings> | undefined {
        return this._settings?.length ? Object.assign({}, ...this._settings) : undefined;
    }

    constructor(private readonly overlay: Overlay, actions$: Actions, @Inject(CONTEXT_MENU_SETTINGS) @Optional() private readonly _settings?: Partial<ContextMenuSettings>[]) {
        // close context menu on navigation
        actions$.pipe(ofType(routerNavigatedAction)).subscribe(() => {
            if (this.overlayRef) {
                this.overlayRef.dispose();
            }
        });
    }

    /**
     * Opens a context menu with the given action list at the given position. Returns the opened `ContextMenuComponent`.
     *
     * @param actions List of context-menu actions.
     * @param position Coordinates of the position where the context menu must be opened.
     * @returns The opened `ContextMenuComponent`.
     */
    open(actions: ContentActionRef[], position: { x: number; y: number }): ContextMenuComponent {
        // close overlayRef if it already exists
        if (this.overlayRef) {
            this.overlayRef.dispose();
        }

        // create overlay
        const overlayRef = this.overlay.create();
        // create component
        const contextMenu = this.attachDialogContainer(overlayRef);
        // open context menu
        contextMenu.open(actions, position, this.settings);
        // bind context menu onClosed
        contextMenu.closed.subscribe(() => overlayRef.dispose());
        // save overlayRef so that it can be closed
        this.overlayRef = overlayRef;
        return contextMenu;
    }

    private attachDialogContainer(overlay: OverlayRef): ContextMenuComponent {
        const containerPortal = new ComponentPortal(ContextMenuComponent);
        const containerRef: ComponentRef<ContextMenuComponent> = overlay.attach(containerPortal);
        return containerRef.instance;
    }
}
