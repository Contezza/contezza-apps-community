import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleOutputDumpComponent } from './js-console-output-dump.component';

describe('JsConsoleOutputDumpComponent', () => {
    let component: JsConsoleOutputDumpComponent;
    let fixture: ComponentFixture<JsConsoleOutputDumpComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleOutputDumpComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleOutputDumpComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
