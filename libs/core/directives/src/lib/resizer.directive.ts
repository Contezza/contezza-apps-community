import { AfterViewInit, Directive, ElementRef, HostBinding, HostListener } from '@angular/core';

type Direction = 'ns' | 'ew';

@Directive({
    standalone: true,
    selector: '[contezzaResizer]',
})
export class ResizerDirective implements AfterViewInit {
    private readonly config: Record<Direction, { cursor: string }> = {
        ns: {
            cursor: 'ns-resize',
        },
        ew: {
            cursor: 'ew-resize',
        },
    };

    direction: Direction;
    firstElement: HTMLElement;
    secondElement: HTMLElement;

    @HostBinding('class.resizing')
    resizing = false;

    @HostBinding('style.cursor')
    cursor: string;

    constructor(private readonly el: ElementRef<HTMLElement>) {}

    ngAfterViewInit() {
        setTimeout(() => {
            // setup based on html structure
            // conditions: (1) parent is a flex container (2) parent has exactly three children (3) the second children is this directive's host
            const parentElement = this.el.nativeElement.parentElement;
            const parentStyle = getComputedStyle(parentElement);
            if (parentStyle.display === 'flex' && parentElement.children.length === 3 && parentElement.children.item(1) === this.el.nativeElement) {
                // resize direction based on the parent flex-direction
                this.direction = parentStyle.flexDirection === 'column' ? 'ns' : 'ew';
                this.cursor = this.config[this.direction].cursor;
                // resized elements are the siblings of this directive's host
                this.firstElement = parentElement.children.item(0) as HTMLElement;
                this.secondElement = parentElement.children.item(2) as HTMLElement;
            } else {
                // warn if conditions are not satisfied
                console.warn('Directive `jsConsoleResize` cannot be applied.');
            }
        }, 10);
    }

    @HostListener('mousedown') onMouseDown() {
        this.resizing = true;
        document.body.style.cursor = this.cursor;
    }

    @HostListener('window:mouseup') onMouseUp() {
        if (this.resizing) {
            this.resizing = false;
            document.body.style.cursor = 'default';
        }
    }

    @HostListener('window:mousemove', ['$event']) onMouseMove(event: MouseEvent) {
        if (this.resizing) {
            event.preventDefault();

            // resizing works by changing the flex-basis of the resized elements
            // computation is based on X or Y coordinates, depending on the direction

            let mouseCoordinate: number;
            let containerSize: number;
            let containerOffset: number;

            switch (this.direction) {
                case 'ns': {
                    // based on Y coordinates
                    mouseCoordinate = event.clientY;
                    containerSize = this.el.nativeElement.parentElement.scrollHeight;
                    containerOffset = window.scrollY + this.el.nativeElement.parentElement.getBoundingClientRect().top;
                    break;
                }
                case 'ew': {
                    // based on X coordinates
                    mouseCoordinate = event.clientX;
                    containerSize = this.el.nativeElement.parentElement.scrollWidth;
                    containerOffset = window.scrollX + this.el.nativeElement.parentElement.getBoundingClientRect().left;
                    break;
                }
            }

            const firstElementSize = mouseCoordinate - containerOffset;
            this.firstElement.style.flex = `1 5 ${firstElementSize}px`;
            this.secondElement.style.flex = `0 5 ${containerSize - firstElementSize}px`;
        }
    }
}
