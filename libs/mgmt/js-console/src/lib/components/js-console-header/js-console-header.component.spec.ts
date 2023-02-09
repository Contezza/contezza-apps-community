import { ComponentFixture, TestBed } from '@angular/core/testing';

import { JsConsoleHeaderComponent } from './js-console-header.component';

describe('JsConsoleHeaderComponent', () => {
    let component: JsConsoleHeaderComponent;
    let fixture: ComponentFixture<JsConsoleHeaderComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            declarations: [JsConsoleHeaderComponent],
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(JsConsoleHeaderComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
