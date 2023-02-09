import { Directive, ElementRef, HostListener, Input } from '@angular/core';

@Directive({
    selector: '[jsConsoleResize]',
})
export class JsConsoleResizeDirective {
    grabber = false;
    heigth: number;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('topResize')
    topElement: HTMLElement;

    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('bottomResize')
    bottomElement: HTMLElement;

    constructor(private el: ElementRef<HTMLElement>) {}

    @HostListener('window:resize', ['$event']) onResize(event) {
        this.heigth = event.target.outerHeight;
    }
    @HostListener('mousedown') onMouseDown() {
        this.grabber = true;
        this.el.nativeElement.classList.add('side-panel');
        document.body.style.cursor = 'ns-resize;';
    }

    @HostListener('window:mouseup') onMouseUp() {
        this.grabber = false;
        this.el.nativeElement.classList.remove('side-panel');
        document.body.style.cursor = 'default';
    }

    @HostListener('window:mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        if (this.grabber) {
            event.preventDefault();

            if (event.movementY > 0) {
                this.bottomElement.style.flex = `0 5 ${(this.heigth || window.screen.availHeight) - event.clientY + 100}px`;
                this.topElement.style.flex = `1 5 ${event.clientY + 30}px`;
            } else {
                this.topElement.style.flex = `0 5 ${event.clientY + 30}px`;
                this.bottomElement.style.flex = `1 5 ${(this.heigth || window.screen.availHeight) - event.clientY + 100}px`;
            }
        }
    }
}
