import { Directive, HostListener, Input, OnDestroy, OnInit } from '@angular/core';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ContextMenu } from '@alfresco/aca-shared/store';

@Directive({
    selector: '[contezzaMatTableContextActions]',
    exportAs: 'contezzaMatTableContextActions',
})
export class ContezzaMatTableContextActionsDirective implements OnInit, OnDestroy {
    private execute$: Subject<any> = new Subject();
    onDestroy$: Subject<boolean> = new Subject<boolean>();

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('acaContextEnable')
    enabled = true;

    @Input()
    contezzaMatTableContextActions?: boolean;

    @Input()
    contextActionCustomName?: string;

    @HostListener('contextmenu', ['$event'])
    onContextMenuEvent(event: MouseEvent) {
        if (event) {
            event.preventDefault();

            if (this.enabled) {
                const target = this.getTarget(event);
                if (target) {
                    this.execute(event, target);
                }
            }
        }
    }

    constructor(private readonly store: Store<unknown>) {}

    ngOnInit() {
        this.execute$.pipe(debounceTime(300), takeUntil(this.onDestroy$)).subscribe((event: MouseEvent) => {
            if (this.contezzaMatTableContextActions) {
                if (this.contextActionCustomName) {
                    this.store.dispatch({ type: this.contextActionCustomName, event });
                } else {
                    this.store.dispatch(new ContextMenu(event));
                }
            }
        });
    }

    ngOnDestroy() {
        this.onDestroy$.next(true);
        this.onDestroy$.complete();
    }

    execute(event: MouseEvent, target: Element) {
        if (!this.isSelected(target)) {
            target.dispatchEvent(new MouseEvent('click'));
        }

        this.execute$.next(event);
    }

    private getTarget(event: MouseEvent): Element {
        const target = event.target as Element;

        return this.findAncestor(target, 'mat-row');
    }

    private isSelected(target: Element): boolean {
        if (!target) {
            return false;
        }
        return this.findAncestor(target, 'mat-row').classList.contains('contezza-mat-table-highlighted');
    }

    private findAncestor(el: Element, className: string): Element {
        if (el.classList.contains(className)) {
            return el;
        }
        while ((el = el.parentElement) && !el.classList.contains(className)) {}
        return el;
    }
}
