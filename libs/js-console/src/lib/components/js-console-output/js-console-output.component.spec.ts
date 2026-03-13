import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleOutputComponent } from './js-console-output.component';

describe('JsConsoleOutputComponent', () => {
    let component: JsConsoleOutputComponent;
    let fixture: ComponentFixture<JsConsoleOutputComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleOutputComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleOutputComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
