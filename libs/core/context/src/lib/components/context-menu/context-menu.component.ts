import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, HostListener, OnDestroy, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule, MatMenuTrigger } from '@angular/material/menu';

import { TranslateModule } from '@ngx-translate/core';

import { Subject } from 'rxjs';

import { ContentActionRef, ExtensionsModule } from '@alfresco/adf-extensions';

import { DetectChangesDirective, IconDirective } from '@contezza/core/directives';

import { ContextMenuSettings } from '../../models';

const defaultSettings: ContextMenuSettings = { hasBackdrop: false };

@Component({
    standalone: true,
    imports: [CommonModule, MatDividerModule, MatIconModule, MatMenuModule, TranslateModule, ExtensionsModule, DetectChangesDirective, IconDirective],
    selector: 'contezza-context-menu',
    templateUrl: 'context-menu.component.html',
    styleUrls: ['context-menu.component.scss'],
    host: {
        class: 'contezza-context-menu',
    },
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ContextMenuComponent implements OnDestroy {
    actions?: ContentActionRef[];
    settings!: ContextMenuSettings;

    private readonly onRunActionSource = new Subject<ContentActionRef>();
    @Output()
    readonly actionClicked = this.onRunActionSource.asObservable();

    private readonly onClosedSource = new Subject<void>();
    @Output()
    readonly closed = this.onClosedSource.asObservable();

    @ViewChild('trigger')
    trigger?: MatMenuTrigger;

    @ViewChild('trigger', { read: ElementRef })
    triggerElement?: ElementRef<HTMLButtonElement>;

    @HostListener('window:click', ['$event'])
    close() {
        if (this.trigger?.menuOpen) {
            this.trigger.closeMenu();
        }
    }

    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnDestroy() {
        this.onRunActionSource.complete();
        this.onClosedSource.complete();
    }

    runAction(action: ContentActionRef) {
        this.onRunActionSource.next(action);
    }

    onClosed() {
        this.onClosedSource.next();
    }

    open(actions: ContentActionRef[], position: { x: number; y: number }, settings?: Partial<ContextMenuSettings>) {
        this.actions = actions;
        this.settings = Object.assign(defaultSettings, settings);
        // detectChanges to evaluate the ngIf's in the template
        this.cd.detectChanges();

        if (this.triggerElement && this.trigger) {
            // set trigger position
            this.triggerElement.nativeElement.style.left = position.x + 'px';
            this.triggerElement.nativeElement.style.top = position.y + 'px';
            // open the new context menu
            this.trigger.openMenu();
        }
    }
}
