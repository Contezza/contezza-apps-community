import { ChangeDetectorRef, Directive, HostListener, Input, OnInit } from '@angular/core';

import { Observable } from 'rxjs';

import { SelectionStore } from '../stores';

type SelectionMouseEvent = MouseEvent & { selectionPrevented?: boolean };

/**
 * To be used in combination with SelectionStore. Maps mouse events on the component into store reducers.
 */
@Directive({
    standalone: true,
    selector: '[contezzaSelectable]',
    exportAs: 'contezzaSelectable',
})
export class ContezzaSelectableDirective<ItemType> implements OnInit {
    @Input('contezzaSelectable')
    item: ItemType;

    @Input()
    isToggle = false;

    @Input()
    selectionDisabled = false;

    selected$: Observable<boolean>;

    constructor(private readonly cd: ChangeDetectorRef, private readonly selection: SelectionStore<ItemType>) {}

    ngOnInit() {
        this.selected$ = this.selection.selected$(this.item);
        this.cd.detectChanges();
    }

    @HostListener('click', ['$event'])
    onClick(event: SelectionMouseEvent) {
        if (!this.selectionDisabled && !event.selectionPrevented) {
            if (this.isToggle || event.ctrlKey || event.metaKey) {
                this.selection.ctrlClick(this.item);
            } else {
                this.selection.click(this.item);
            }
        }
    }

    @HostListener('dblclick', ['$event'])
    onDblClick(event: SelectionMouseEvent) {
        if (!this.selectionDisabled && !event.selectionPrevented) {
            this.selection.dblClick(this.item);
        }
    }

    @HostListener('contextmenu')
    onRightClick() {
        this.selection.rightClick(this.item);
    }

    @HostListener('dragstart')
    onDragStart() {
        this.selection.drag(this.item);
    }
}
