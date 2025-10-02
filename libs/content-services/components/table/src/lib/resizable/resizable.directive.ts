import { DOCUMENT } from '@angular/common';
import { Directive, ElementRef, Inject, Output, Renderer2 } from '@angular/core';
import { distinctUntilChanged, finalize, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { BehaviorSubject, fromEvent } from 'rxjs';

@Directive({
    standalone: false,
    selector: '[contezzaResizable]',
    exportAs: 'contezzaResizable',
})
export class ContezzaResizableDirective {
    @Output()
    readonly contezzaResizable = fromEvent<MouseEvent>(this.elementRef.nativeElement, 'mousedown').pipe(
        tap((e) => e.preventDefault()),
        switchMap(() => {
            const { width, right } = this.elementRef.nativeElement.closest('th').getBoundingClientRect();

            return fromEvent<MouseEvent>(this.documentRef, 'mousemove').pipe(
                map(({ clientX }) => {
                    this.resizingSource.next(true);
                    this.renderer.setStyle(this.elementRef.nativeElement.closest('th'), 'min-width', width + clientX - right + 'px');
                    return width + clientX - right;
                }),
                distinctUntilChanged(),
                finalize(() => this.resizingSource.next(false)),
                takeUntil(fromEvent(this.documentRef, 'mouseup'))
            );
        })
    );

    private readonly resizingSource = new BehaviorSubject<boolean>(false);

    @Output()
    readonly resizing = this.resizingSource.asObservable();

    constructor(
        @Inject(DOCUMENT) private readonly documentRef: Document,
        @Inject(ElementRef)
        private readonly elementRef: ElementRef<HTMLElement>,
        private readonly renderer: Renderer2
    ) {}
}
