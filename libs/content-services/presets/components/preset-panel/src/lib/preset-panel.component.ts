import { ChangeDetectionStrategy, Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';

import { ContentActionRef, ExtensionService } from '@alfresco/adf-extensions';
import { ResultNode } from '@alfresco/js-api';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { TranslateModule } from '@ngx-translate/core';
import { ContezzaLetModule } from '@contezza/core/directives';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { PresetService } from '@contezza/content-services/presets/shared';
import { Observable, takeUntil } from 'rxjs';
import { ActionsService, ContextMenuOverlayService } from '@contezza/core/context';
import { DestroyService, RefreshSubject } from '@contezza/core/services';
import { MatListModule } from '@angular/material/list';

@Component({
    standalone: true,
    imports: [CommonModule, MatButtonModule, TranslateModule, ContezzaLetModule, MatCardModule, MatIconModule, MatTooltipModule, MatListModule],
    selector: 'contezza-preset-panel',
    templateUrl: 'preset-panel.component.html',
    styleUrls: ['preset-panel.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
    providers: [DestroyService, ActionsService],
})
export class PresetPanelComponent implements OnInit {
    presetNodes$: Observable<ResultNode[]> = this.presetService.presetNodes$.asObservable();

    @Input()
    data!: ContentActionRef;

    @Output()
    loadPresets: EventEmitter<any> = new EventEmitter();

    @Output()
    loadPreset: EventEmitter<string> = new EventEmitter<string>();

    @Output()
    savePreset: EventEmitter<any> = new EventEmitter();

    @Output()
    saveNewVersion: EventEmitter<string> = new EventEmitter<string>();

    constructor(
        private readonly presetService: PresetService,
        private readonly extensions: ExtensionService,
        private readonly overlay: ContextMenuOverlayService,
        private readonly actionsService: ActionsService,
        private readonly refresh$: RefreshSubject,
        @Inject(DestroyService) readonly destroy$: DestroyService
    ) {
        this.refresh$.pipe(takeUntil(this.destroy$)).subscribe(() => this.load());
    }

    ngOnInit() {
        this.load();
    }

    load(): void {
        this.loadPresets.emit();
    }

    onSavePreset(): void {
        this.savePreset.emit();
    }

    onLoadPreset(id: string): void {
        this.loadPreset.emit(id);
    }

    onRightClick(e: MouseEvent, presetId: string): void {
        e.preventDefault();

        const actions = this.extensions.getFeature('presets.contextMenu');

        const position = { x: e.x, y: e.y };
        const contextMenu = this.overlay.open(actions, position);

        contextMenu.actionClicked.subscribe((action) => {
            if (action.actions?.click) {
                action.id === 'content-services.presets.save-new-version'
                    ? this.saveNewVersion.emit(presetId)
                    : this.actionsService.runActionById(action.actions?.click, {
                          payload: {
                              presetId,
                          },
                      });
            }
        });
    }

    getTitle(node: ResultNode): string {
        return node?.properties['cm:title'] ?? node?.name;
    }
}
