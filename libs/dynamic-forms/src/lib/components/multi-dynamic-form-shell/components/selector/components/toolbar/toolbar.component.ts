import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { ToolbarModule } from '@alfresco/adf-core';
import { ContentActionRef, ContentActionType } from '@alfresco/adf-extensions';
import { SharedToolbarModule } from '@alfresco/aca-shared';

import { DynamicFormItem } from '@contezza/dynamic-forms/shared';

import { MultiDynamicFormShellStore } from '../../../../multi-dynamic-form-shell.store';

@Component({
    standalone: true,
    imports: [CommonModule, SharedToolbarModule, ToolbarModule],
    selector: 'contezza-toolbar',
    templateUrl: './toolbar.component.html',
    // styleUrls: ['./selector.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToolbarComponent implements OnInit {
    private _actions: ContentActionRef[] = [
        {
            id: 'copy-to-all',
            type: ContentActionType.button,
            title: 'Toepassen op alles',
            icon: 'content_copy',
            rules: {
                visible: 'isActive',
            },
            actions: { click: 'copyToAll' },
        },
        {
            id: 'copy-to-active',
            type: ContentActionType.button,
            title: 'Toepassen op huidige formulier',
            icon: 'arrow_forward',
            rules: {
                visible: '!isActive',
            },
            actions: { click: 'copyToActive' },
        },
    ];

    @Input()
    target: DynamicFormItem;

    @Input()
    key: string;

    actions$: Observable<ContentActionRef[]>;

    constructor(private readonly store: MultiDynamicFormShellStore) {}

    ngOnInit() {
        this.actions$ = this.store
            .active$(this.target)
            .pipe(map((active) => this._actions.filter((action) => !action.rules?.visible || action.rules.visible === (active ? 'isActive' : '!isActive'))));
    }

    onActionClick(action: ContentActionRef) {
        this.store.runAction({ type: action.actions.click, target: this.target });
    }
}
