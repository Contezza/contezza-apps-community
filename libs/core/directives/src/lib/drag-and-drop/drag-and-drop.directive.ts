import { Directive, HostListener, Input } from '@angular/core';

import { BehaviorSubject } from 'rxjs';

@Directive({
    standalone: true,
    selector: '[contezzaDragAndDrop]',
    exportAs: 'contezzaDragAndDrop',
})
export class ContezzaDragAndDropDirective {
    @Input('contezzaDragAndDrop')
    droppable = true;

    private dragHoveredSource = new BehaviorSubject<boolean>(false);
    dragHovered$ = this.dragHoveredSource.asObservable();

    @HostListener('dragover', ['$event'])
    onDragOver(event: DragEvent) {
        event.preventDefault();
        this.dragHoveredSource.next(true);
    }

    @HostListener('dragenter')
    onDragEnter() {
        this.dragHoveredSource.next(true);
    }

    @HostListener('dragleave')
    onDragLeave() {
        this.dragHoveredSource.next(false);
    }

    @HostListener('drop', ['$event'])
    onDrop(event: DragEvent) {
        this.dragHoveredSource.next(false);
        if (!this.droppable) {
            event.preventDefault();
            event.stopPropagation();
        }
    }
}
