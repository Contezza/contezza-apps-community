import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleContentExecutionParamsComponent } from './js-console-content-execution-params.component';

describe('JsConsoleContentExecutionParamsComponent', () => {
    let component: JsConsoleContentExecutionParamsComponent;
    let fixture: ComponentFixture<JsConsoleContentExecutionParamsComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleContentExecutionParamsComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleContentExecutionParamsComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
