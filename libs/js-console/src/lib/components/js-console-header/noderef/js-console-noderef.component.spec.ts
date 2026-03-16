import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleNoderefComponent } from './js-console-noderef.component';

describe('JsConsoleNoderefComponent', () => {
    let component: JsConsoleNoderefComponent;
    let fixture: ComponentFixture<JsConsoleNoderefComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleNoderefComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleNoderefComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
