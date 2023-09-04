import { ChangeDetectionStrategy, Component, Input } from '@angular/core';

import { DEFAULT_TRANSITION, SatPopover, SatPopoverModule } from '@ncstate/sat-popover';

/**
 * Wraps @ncstate/sat-popover with fancy styling.
 */
@Component({
    standalone: true,
    imports: [SatPopoverModule],
    selector: 'contezza-popover',
    template: `<div
            [satPopoverAnchor]="infoPopover"
            (click)="showPopoverOn === 'click' && infoPopover.toggle()"
            (mouseenter)="showPopoverOn === 'hover' && infoPopover.open()"
            (mouseleave)="showPopoverOn === 'hover' && infoPopover.close()"
        >
            <ng-content></ng-content>
        </div>
        <sat-popover #infoPopover [horizontalAlign]="horizontalAlign" [verticalAlign]="verticalAlign" [hasBackdrop]="showPopoverOn === 'click'">
            <div class="contezza-popover-tooltip" [class]="position">
                {{ tooltip }}
            </div>
        </sat-popover>`,
    styleUrls: ['popover.component.scss'],
    host: { class: 'contezza-popover' },
    providers: [{ provide: DEFAULT_TRANSITION, useValue: '200ms cubic-bezier(0.25, 0.8, 0.25, 1)' }],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PopoverComponent {
    @Input()
    readonly tooltip: string;

    @Input()
    set position(value: 'right' | 'left' | 'above' | 'below') {
        this._position = value;
        switch (value) {
            case 'right':
                this.horizontalAlign = 'after';
                this.verticalAlign = 'center';
                break;
            case 'left':
                this.horizontalAlign = 'before';
                this.verticalAlign = 'center';
                break;
            case 'above':
                this.horizontalAlign = 'center';
                this.verticalAlign = 'above';
                break;
            case 'below':
                this.horizontalAlign = 'center';
                this.verticalAlign = 'below';
                break;
        }
    }
    get position(): 'right' | 'left' | 'above' | 'below' {
        return this._position;
    }
    private _position: 'right' | 'left' | 'above' | 'below' = 'right';

    @Input()
    horizontalAlign?: SatPopover['horizontalAlign'] = 'after';

    @Input()
    verticalAlign?: SatPopover['verticalAlign'] = 'center';

    @Input()
    showPopoverOn: 'click' | 'hover' = 'click';
}
