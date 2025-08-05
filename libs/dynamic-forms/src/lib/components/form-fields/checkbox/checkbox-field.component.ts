import { ChangeDetectionStrategy, Component, ElementRef, OnInit, ViewChild } from '@angular/core';

import { takeUntil } from 'rxjs';

import { ContezzaBaseFieldComponent } from '../base-field.component';

@Component({
    selector: 'contezza-checkbox-field',
    templateUrl: './checkbox-field.component.html',
    styleUrls: ['./checkbox-field.component.scss'],
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CheckboxFieldComponent extends ContezzaBaseFieldComponent<boolean> implements OnInit {
    @ViewChild('checkbox', { read: ElementRef, static: true })
    checkboxRef!: ElementRef;

    ngOnInit() {
        super.ngOnInit();

        // prevent keyboard interaction
        const nativeEl: HTMLElement = this.checkboxRef.nativeElement;
        const input: HTMLInputElement | null = nativeEl.querySelector('input[type="checkbox"]');

        if (input) {
            this.readonly$.pipe(takeUntil(this.destroy$)).subscribe((readonly) => {
                if (readonly) {
                    setTimeout(() => (input.tabIndex = -1), 0);
                } else {
                    input.tabIndex = 0;
                }
            });
        }
    }
}
