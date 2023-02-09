import { Injectable } from '@angular/core';
import { ComponentPortal } from '@angular/cdk/portal';
import { Overlay, OverlayRef } from '@angular/cdk/overlay';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { combineLatest, Observable, Subscription } from 'rxjs';

/**
 * Service to show / hide spinner (loading indicator)
 */

@Injectable({
    providedIn: 'root',
})
export class SpinnerOverlayService {
    overlayRef: OverlayRef = null;

    private keyGen = 0;

    private loadingSources: { [key: string]: Observable<boolean> } = {};
    private loadingSourcesSubscription: Subscription;

    constructor(private readonly overlay: Overlay) {}

    show(offset?: string) {
        if (!this.overlayRef) {
            this.overlayRef = this.overlay.create({
                hasBackdrop: true,
                backdropClass: 'dark-backdrop',
                positionStrategy: this.overlay.position().global().centerHorizontally(offset).centerVertically(),
            });
        }
        if (!this.overlayRef.hasAttached()) {
            this.overlayRef.attach(new ComponentPortal(MatProgressSpinner)).setInput('mode', 'indeterminate');
        }
    }

    hide() {
        if (!!this.overlayRef) {
            this.overlayRef.detach();
        }
    }

    bind(loadingSource: Observable<boolean>, key?: string) {
        this.stopSubscription();
        this.loadingSources[key ?? this.generateKey()] = loadingSource;
        this.startSubscription();
    }

    unbind(key: string) {
        this.stopSubscription();
        delete this.loadingSources[key];
        this.startSubscription();
    }

    private startSubscription() {
        this.loadingSourcesSubscription = combineLatest(Object.values(this.loadingSources)).subscribe((loadings: Array<boolean>) => {
            if (loadings.some((loading) => loading)) {
                this.show();
            } else {
                this.hide();
            }
        });
    }

    private stopSubscription() {
        if (this.loadingSourcesSubscription) {
            this.loadingSourcesSubscription.unsubscribe();
        }
    }

    private generateKey(): string {
        this.keyGen++;
        return '' + this.keyGen;
    }
}
