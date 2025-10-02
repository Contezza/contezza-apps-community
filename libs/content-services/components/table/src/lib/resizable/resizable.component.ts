import { Component, EventEmitter, HostBinding, Input, OnInit, Output } from '@angular/core';
import { filter, map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Component({
    standalone: false,
    // eslint-disable-next-line @angular-eslint/component-selector
    selector: 'th[contezzaResizable]',
    template: `
        <div class="wrapper">
            <div class="content">
                <ng-content />
            </div>
            <div *ngIf="contezzaResizable" class="bar" (contezzaResizable)="onResize($event)" (resizing)="resizing.next($event)"></div>
        </div>
    `,
    styleUrls: ['./resizable.component.scss'],
})
export class ContezzaResizableComponent implements OnInit {
    @Input()
    @HostBinding('class.contezza-resizable')
    contezzaResizable: boolean;

    @Input()
    width?: number;

    @Output()
    readonly resizing = new EventEmitter<boolean>();

    @Output()
    readonly resized: Observable<number> = this.resizing.pipe(
        filter((value) => !value),
        map(() => this.width),
        filter((value) => typeof value === 'number')
    );

    @HostBinding('style.width.px')
    hostWidth: number | null = null;

    @HostBinding('style.min-width.px')
    hostMinWidth: number | null = null;

    @HostBinding('class.contezza-resized')
    classResized = false;

    ngOnInit() {
        if (this.width) {
            this.hostWidth = this.width;
            this.hostMinWidth = this.width;
            this.classResized = true;
        }
    }

    onResize(width: number) {
        this.width = width;
        this.hostWidth = width;
        this.hostMinWidth = width;
        this.classResized = true;
    }
}
