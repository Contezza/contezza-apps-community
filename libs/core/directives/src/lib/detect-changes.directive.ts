import { ChangeDetectorRef, Directive, Input, OnDestroy, OnInit } from '@angular/core';

/**
 * Fixes change detection problems in host component by manually triggering `ChangeDetectorRef.detectChanges()` on an interval.
 * Interval time can be specified as input and manually started and stopped by using methods `start()` and `stop()` respectively.
 * By default, this behaviour starts on component initialisation, is triggered every second and stops on component destruction.
 */
@Directive({
    standalone: true,
    selector: '[contezza-detect-changes], [contezzaDetectChanges]',
    exportAs: 'contezzaDetectChanges',
})
export class DetectChangesDirective implements OnInit, OnDestroy {
    @Input()
    contezzaDetectChanges = 1000;

    private interval!: NodeJS.Timer;

    constructor(private readonly cd: ChangeDetectorRef) {}

    ngOnInit() {
        this.start();
    }

    ngOnDestroy() {
        this.stop();
    }

    detectChanges() {
        this.cd.detectChanges();
    }

    start() {
        this.interval = setInterval(() => this.detectChanges(), this.contezzaDetectChanges);
    }

    stop() {
        clearInterval(this.interval);
    }
}
