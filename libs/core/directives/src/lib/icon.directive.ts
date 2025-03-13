import { Directive, Input, OnInit } from '@angular/core';
import { MatIcon } from '@angular/material/icon';

/**
 *  This directive has the same behaviour as adf-icon without adding an extra wrapper around mat-icon.
 */
@Directive({
    standalone: true,
    selector: 'mat-icon[contezzaIcon]',
})
export class IconDirective implements OnInit {
    @Input()
    contezzaIcon: string;

    constructor(private readonly matIcon: MatIcon) {}

    ngOnInit() {
        if (this.isSvg()) {
            this.matIcon.svgIcon = this.contezzaIcon;
        } else {
            const el: Element = this.matIcon._elementRef.nativeElement;
            el.innerHTML = this.contezzaIcon;
        }
    }

    private isSvg(): boolean {
        return this.contezzaIcon.includes(':');
    }
}
