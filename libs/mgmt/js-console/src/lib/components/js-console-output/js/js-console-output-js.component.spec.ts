import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleOutputJsComponent } from './js-console-output-js.component';

describe('JsConsoleOutputJsComponent', () => {
    let component: JsConsoleOutputJsComponent;
    let fixture: ComponentFixture<JsConsoleOutputJsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleOutputJsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleOutputJsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
